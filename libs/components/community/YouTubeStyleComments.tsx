import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Comment, CommentSortBy } from '../../types/comment/comment';
import { CommentGroup } from '../../enums/comment.enum';

interface YouTubeStyleCommentsProps {
  comments: Comment[];
  loading: boolean;
  error?: any;
  onCommentSubmit: (content: string, parentId?: string) => void;
  onCommentLike: (commentId: string) => void;
  onCommentDelete: (commentId: string) => void;
  commentLoading?: boolean;
  sortBy: CommentSortBy;
  onSortChange: (sortBy: CommentSortBy) => void;
}

const YouTubeStyleComments: React.FC<YouTubeStyleCommentsProps> = ({
  comments,
  loading,
  error,
  onCommentSubmit,
  onCommentLike,
  onCommentDelete,
  commentLoading = false,
  sortBy,
  onSortChange,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const formatRelativeTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
    } catch {
      return '방금 전';
    }
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    onCommentSubmit(newComment);
    setNewComment('');
  };

  const handleReplySubmit = (parentId: string) => {
    if (!replyContent.trim()) return;
    onCommentSubmit(replyContent, parentId);
    setReplyContent('');
    setReplyingTo(null);
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <Box key={comment._id} sx={{ mb: 2, ml: isReply ? 4 : 0 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar 
          src={comment.memberData?.memberImage} 
          sx={{ width: 32, height: 32, flexShrink: 0 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {comment.memberData?.memberNick || '익명'}
            </Typography>
            {comment.memberData?.memberType === 'AGENT' && (
              <Chip
                label="전문가"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(comment.createdAt)}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {comment.commentContent}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => onCommentLike(comment._id)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <ThumbUpOutlinedIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              0
            </Typography>
            
            {!isReply && (
              <>
                <IconButton 
                  size="small" 
                  onClick={() => setReplyingTo(comment._id)}
                  sx={{ color: 'text.secondary' }}
                >
                  <ReplyIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  답글
                </Typography>
              </>
            )}
          </Box>

          {/* 답글 입력창 */}
          {replyingTo === comment._id && !isReply && (
            <Box sx={{ mt: 2, ml: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24 }} />
                <Typography variant="caption" color="text.secondary">
                  {comment.memberData?.memberNick || '익명'}에게 답글
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="답글을 입력하세요..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  multiline
                  rows={2}
                  sx={{ flex: 1 }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleReplySubmit(comment._id)}
                    disabled={!replyContent.trim() || commentLoading}
                  >
                    답글
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    취소
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* 대댓글 표시 - 현재 GraphQL 스키마에서 지원하지 않음 */}
          {/* {comment.replies && comment.replies.length > 0 && !isReply && (
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                startIcon={expandedReplies.has(comment._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => toggleReplies(comment._id)}
                sx={{ color: 'text.secondary', mb: 1 }}
              >
                답글 {comment.replies.length}개 {expandedReplies.has(comment._id) ? '숨기기' : '보기'}
              </Button>
              
              <Collapse in={expandedReplies.has(comment._id)}>
                <Box sx={{ ml: 2 }}>
                  {comment.replies.map((reply) => renderComment(reply, true))}
                </Box>
              </Collapse>
            </Box>
          )} */}
        </Box>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        댓글을 불러오는 중 오류가 발생했습니다: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* 댓글 작성창 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              multiline
              rows={3}
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || commentLoading}
              >
                {commentLoading ? <CircularProgress size={20} /> : '댓글 작성'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 정렬 옵션 */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={(_, value) => value && onSortChange(value)}
          size="small"
        >
          <ToggleButton value={CommentSortBy.NEWEST}>
            최신순
          </ToggleButton>
          <ToggleButton value={CommentSortBy.POPULAR}>
            인기순
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 댓글 목록 */}
      <Box>
        {comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {comments.map((comment) => renderComment(comment))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default YouTubeStyleComments;
