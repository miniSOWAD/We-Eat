"use client";

import { MessageCircle, Reply, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Comment } from "@/types";

function CommentNode({comment,listingId,onChanged,signedIn}:{comment:Comment;listingId:string;onChanged:()=>void;signedIn:boolean}){
  const [replying,setReplying]=useState(false);const [text,setText]=useState("");
  async function submit(){try{await api(`/listings/${listingId}/comments`,{method:"POST",body:{content:text,parent_comment_id:comment.id}});setText("");setReplying(false);onChanged()}catch(e){toast.error(e instanceof Error?e.message:"Unable to reply")}}
  async function remove(){try{await api(`/listings/${listingId}/comments/${comment.id}`,{method:"DELETE"});onChanged()}catch(e){toast.error(e instanceof Error?e.message:"Unable to remove")}}
  return <div style={{borderLeft:"3px solid var(--blue)",paddingLeft:14,marginTop:16}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12}}><div><strong>{comment.user.display_name}</strong><div className="muted" style={{fontSize:12}}>{new Date(comment.created_at).toLocaleString("en-BD")}</div></div>{signedIn&&!comment.is_deleted&&<button className="button buttonGhost" style={{padding:8,width:"auto"}} onClick={remove} aria-label="Remove comment"><Trash2 size={14}/></button>}</div>
    <p style={{lineHeight:1.65}}>{comment.content}</p>
    {signedIn&&!comment.is_deleted&&<button className="button buttonGhost" style={{padding:"8px 12px",width:"auto"}} onClick={()=>setReplying(!replying)}><Reply size={14}/>Reply</button>}
    {replying&&<div className="stack" style={{marginTop:12}}><textarea className="textarea" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a respectful reply"/><button className="button buttonPrimary" disabled={!text.trim()} onClick={submit}>Post reply</button></div>}
    {comment.replies?.map(reply=><CommentNode key={reply.id} comment={reply} listingId={listingId} onChanged={onChanged} signedIn={signedIn}/>) }
  </div>
}

export function Comments({listingId,initialComments,signedIn}:{listingId:string;initialComments:Comment[];signedIn:boolean}){
  const [comments,setComments]=useState(initialComments);const [text,setText]=useState("");
  async function refresh(){try{setComments(await api<Comment[]>(`/listings/${listingId}/comments`))}catch{}}
  async function submit(){try{await api(`/listings/${listingId}/comments`,{method:"POST",body:{content:text}});setText("");await refresh()}catch(e){toast.error(e instanceof Error?e.message:"Unable to comment")}}
  return <section className="card" style={{padding:28}}><h2 style={{display:"flex",alignItems:"center",gap:10}}><MessageCircle/>Community questions</h2>
    {signedIn?<div className="stack"><textarea className="textarea" value={text} onChange={e=>setText(e.target.value)} placeholder="Ask about ingredients, timing or collection"/><button className="button buttonPrimary" disabled={!text.trim()} onClick={submit}>Post comment</button></div>:<p className="muted">Sign in to ask a question.</p>}
    <hr className="divider"/>{comments.length?comments.map(c=><CommentNode key={c.id} comment={c} listingId={listingId} onChanged={refresh} signedIn={signedIn}/>):<p className="muted">No questions yet.</p>}
  </section>;
}
