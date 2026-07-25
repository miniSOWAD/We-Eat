from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import Comment, Listing, ListingStatus, User, UserRole
from app.schemas.common import MessageResponse
from app.schemas.interactions import CommentCreate, CommentUpdate, CommentView

router = APIRouter(prefix="/listings/{listing_id}/comments", tags=["Comments"])


def build_comment_tree(rows: list[Comment]) -> list[CommentView]:
    nodes: dict[UUID, CommentView] = {}
    roots: list[CommentView] = []
    for row in rows:
        content = "Comment removed" if row.is_deleted else row.content
        nodes[row.id] = CommentView(
            id=row.id,
            listing_id=row.listing_id,
            parent_comment_id=row.parent_comment_id,
            content=content,
            is_deleted=row.is_deleted,
            user=row.user,
            created_at=row.created_at,
            updated_at=row.updated_at,
            replies=[],
        )
    for row in rows:
        node = nodes[row.id]
        if row.parent_comment_id and row.parent_comment_id in nodes:
            nodes[row.parent_comment_id].replies.append(node)
        else:
            roots.append(node)
    return roots


@router.get("", response_model=list[CommentView])
async def list_comments(listing_id: UUID, session: AsyncSession = Depends(get_db)) -> list[CommentView]:
    exists = await session.scalar(
        select(Listing.id).where(Listing.id == listing_id, Listing.status != ListingStatus.REMOVED)
    )
    if not exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    rows = (
        await session.scalars(
            select(Comment)
            .where(Comment.listing_id == listing_id)
            .options(selectinload(Comment.user))
            .order_by(Comment.created_at.asc())
        )
    ).all()
    return build_comment_tree(list(rows))


@router.post("", response_model=CommentView, status_code=201)
async def create_comment(
    listing_id: UUID,
    payload: CommentCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> CommentView:
    listing = await session.scalar(
        select(Listing).where(Listing.id == listing_id, Listing.status != ListingStatus.REMOVED)
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if payload.parent_comment_id:
        parent = await session.scalar(
            select(Comment).where(
                Comment.id == payload.parent_comment_id, Comment.listing_id == listing_id
            )
        )
        if not parent:
            raise HTTPException(status_code=400, detail="Parent comment is invalid")
    comment = Comment(
        listing_id=listing_id,
        user_id=user.id,
        parent_comment_id=payload.parent_comment_id,
        content=payload.content.strip(),
    )
    session.add(comment)
    await session.commit()
    comment = await session.scalar(
        select(Comment).where(Comment.id == comment.id).options(selectinload(Comment.user))
    )
    assert comment
    return build_comment_tree([comment])[0]


@router.patch("/{comment_id}", response_model=CommentView)
async def update_comment(
    listing_id: UUID,
    comment_id: UUID,
    payload: CommentUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> CommentView:
    comment = await session.scalar(
        select(Comment)
        .where(Comment.id == comment_id, Comment.listing_id == listing_id)
        .options(selectinload(Comment.user))
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != user.id:
        raise HTTPException(status_code=403, detail="You cannot edit this comment")
    if comment.is_deleted:
        raise HTTPException(status_code=409, detail="Deleted comments cannot be edited")
    comment.content = payload.content.strip()
    await session.commit()
    return build_comment_tree([comment])[0]


@router.delete("/{comment_id}", response_model=MessageResponse)
async def delete_comment(
    listing_id: UUID,
    comment_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> MessageResponse:
    comment = await session.scalar(
        select(Comment).where(Comment.id == comment_id, Comment.listing_id == listing_id)
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != user.id and user.role not in (UserRole.MODERATOR, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="You cannot remove this comment")
    comment.is_deleted = True
    comment.content = ""
    await session.commit()
    return MessageResponse(message="Comment removed")
