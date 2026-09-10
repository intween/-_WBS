/**
 * 업무별 코멘트 스레드.
 * 최신순으로 보여주고, 작성은 Enter 가 아니라 버튼/Cmd+Enter 로 한다.
 */
import { useMemo, useState } from 'react';
import { Avatar, Button, EmptyState, Textarea } from '@/components/common';
import { COMMENT_MAX_LENGTH } from '@/constants/config';
import { formatRelativeTime } from '@/utils/format';
import { useCurrentMember, useWbs } from '@/context/hooks';
import './CommentThread.scss';

/**
 * @param {Object} props
 * @param {string} props.taskId
 */
function CommentThread({ taskId }) {
  const { comments, memberMap, addComment, removeComment } = useWbs();
  const { memberId } = useCurrentMember();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const threadComments = useMemo(
    () => comments.filter((comment) => comment.task_id === taskId),
    [comments, taskId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || busy) return;

    setBusy(true);
    const result = await addComment(taskId, body);
    setBusy(false);
    if (result?.ok) setDraft('');
  };

  const handleKeyDown = (event) => {
    // Cmd/Ctrl + Enter 로 빠르게 등록
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  return (
    <div className="comment-thread">
      <form className="comment-thread__form" onSubmit={handleSubmit}>
        <Textarea
          value={draft}
          maxLength={COMMENT_MAX_LENGTH}
          minHeight={44}
          placeholder="팀원에게 남길 말을 적어주세요."
          ariaLabel="코멘트 입력"
          onChange={setDraft}
          onKeyDown={handleKeyDown}
        />
        <div className="comment-thread__form-foot">
          <span className="comment-thread__hint">Cmd(Ctrl) + Enter 로 등록</span>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={busy || !draft.trim()}
          >
            등록
          </Button>
        </div>
      </form>

      {threadComments.length === 0 ? (
        <EmptyState size="sm" iconName="comment" title="아직 코멘트가 없습니다" />
      ) : (
        <ul className="comment-thread__list">
          {threadComments.map((comment) => {
            const author = comment.member_id ? memberMap[comment.member_id] : null;
            const isMine = Boolean(memberId) && comment.member_id === memberId;

            return (
              <li className="comment-thread__item" key={comment.id}>
                <Avatar member={author} size="sm" />
                <div className="comment-thread__body">
                  <div className="comment-thread__meta">
                    <span className="comment-thread__author">
                      {author?.name || '알 수 없음'}
                    </span>
                    <span className="comment-thread__time">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                    {isMine && (
                      <button
                        type="button"
                        className="comment-thread__delete"
                        aria-label="내 코멘트 삭제"
                        onClick={() => removeComment(comment.id)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="comment-thread__text">{comment.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CommentThread;
