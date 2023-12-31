import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { FC } from "react";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = async ({ postId }: CommentSectionProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId: postId,
      replyToId: null, // only fetch top-level comments
    },
    include: {
      author: true,
      votes: true,
      replies: {
        // first level replies
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  console.log("comments Data!!!", comments);

  return (
    <div className="flex flex-col gap-y-4 mt-4 ">
      <hr className="w-full h-px my-6 " />

      <CreateComment postId={postId} replyToId="" />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;
                return acc;
              },
              0
            );

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user?.id
            );
            
            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment comment={topLevelComment} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentSection;
