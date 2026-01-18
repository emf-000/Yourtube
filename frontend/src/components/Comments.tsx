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

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">
        {comments.length} Comments
      </h2>

      {/* Add Comment */}
      {user && (
        <div className="flex gap-3 sm:gap-4">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-[70px] sm:min-h-[80px] text-sm sm:text-base resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {}}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 sm:gap-4">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-xs sm:text-sm">
                    {comment.usercommented}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-600">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago · 📍
                    {comment.city || "Unknown"}
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" disabled={!editText.trim()}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm">
                      {comment.translated?.trim()
                        ? comment.translated
                        : comment.commentbody}
                    </p>

                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm mt-2">
                      <button onClick={() => {}}>
                        👍 {comment.likes?.length || 0}
                      </button>
                      <button onClick={() => {}}>
                        👎 {comment.dislikes?.length || 0}
                      </button>
                      <button onClick={() => {}}>
                        {translatingId === comment._id
                          ? "Translating..."
                          : "🌐 Translate"}
                      </button>
                    </div>

                    {comment.userid === user?._id && (
                      <div className="flex gap-3 mt-2 text-xs sm:text-sm text-gray-500">
                        <button>Edit</button>
                        <button>Delete</button>
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
