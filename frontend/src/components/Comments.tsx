import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  city?: string;
  likes?: string[];
  dislikes?: string[];
  translated?: string;
}

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading comments...</div>;

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
      });

      if (res.data.comment) {
        setComments((prev) => [res.data.comment, ...prev]);
      }

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    try {
      await axiosInstance.post(`/comment/editcomment/${editingCommentId}`, {
        commentbody: editText,
      });

      setComments((prev) =>
        prev.map((c) =>
          c._id === editingCommentId ? { ...c, commentbody: editText } : c
        )
      );
      setEditingCommentId(null);
      setEditText("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const res = await axiosInstance.post(`/comment/like/${id}`, { userId: user._id });
      setComments((prev) =>
        prev.map((c) => (c._id === id ? { ...c, likes: res.data.likes } : c))
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislike = async (id: string) => {
    try {
      const res = await axiosInstance.post(`/comment/dislike/${id}`, { userId: user._id });
      if (res.data.removed) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      } else {
        setComments((prev) =>
          prev.map((c) => (c._id === id ? { ...c, dislikes: res.data.dislikes } : c))
        );
      }
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  // ✅ AUTO-DETECT + TRANSLATE TO ENGLISH
  const handleTranslate = async (text: string, id: string) => {
    try {
      setTranslatingId(id);
      const res = await axiosInstance.post("/comment/translate", { text });

      setComments((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, translated: res.data.translatedText } : c
        )
      );
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setTranslatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setNewComment("")} disabled={!newComment.trim()}>
                Cancel
              </Button>
              <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.usercommented}</span>
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago · 📍{comment.city || "Unknown"}
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                      <Button onClick={handleUpdateComment} disabled={!editText.trim()}>
                        Save
                      </Button>
                      <Button variant="ghost" onClick={() => { setEditingCommentId(null); setEditText(""); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">
                      {comment.translated?.trim() ? comment.translated : comment.commentbody}
                    </p>

                    <div className="flex gap-4 text-sm mt-2">
                      <button onClick={() => handleLike(comment._id)}>👍 {comment.likes?.length || 0}</button>
                      <button onClick={() => handleDislike(comment._id)}>👎 {comment.dislikes?.length || 0}</button>
                      <button onClick={() => handleTranslate(comment.commentbody, comment._id)}>
                        {translatingId === comment._id ? "Translating..." : "🌐 Translate"}
                      </button>
                    </div>

                    {comment.userid === user?._id && (
                      <div className="flex gap-2 mt-2 text-sm text-gray-500">
                        <button onClick={() => handleEdit(comment)}>Edit</button>
                        <button onClick={() => handleDelete(comment._id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
