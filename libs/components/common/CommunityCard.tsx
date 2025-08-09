import React from 'react';
import { Stack, Typography, Box, Avatar } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import { format } from 'date-fns';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	likeArticleHandler?: (e: any, user: any, id: string) => void;
	size?: 'small' | 'medium' | 'large';
}

const CommunityCard: React.FC<CommunityCardProps> = ({ boardArticle, likeArticleHandler, size = 'medium' }) => {
	const handleLikeClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (likeArticleHandler) {
			likeArticleHandler(e, null, boardArticle._id);
		}
	};

	const formatDate = (date: Date | string) => {
		try {
			const dateObj = typeof date === 'string' ? new Date(date) : date;
			return format(dateObj, 'MMM dd, yyyy');
		} catch {
			return typeof date === 'string' ? date : date.toISOString();
		}
	};

	return (
		<Stack className="community-card" sx={{ 
			padding: size === 'small' ? '12px' : '16px',
			border: '1px solid #e0e0e0',
			borderRadius: '8px',
			marginBottom: '12px',
			cursor: 'pointer',
			'&:hover': {
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				transition: 'box-shadow 0.3s ease'
			}
		}}>
			<Stack direction="row" spacing={2} alignItems="flex-start">
				{boardArticle.articleImage && (
					<Box sx={{ 
						width: size === 'small' ? '80px' : '120px', 
						height: size === 'small' ? '60px' : '90px',
						borderRadius: '8px',
						overflow: 'hidden',
						flexShrink: 0
					}}>
						<img
							src={`${REACT_APP_API_URL}/${boardArticle.articleImage}`}
							alt={boardArticle.articleTitle}
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						/>
					</Box>
				)}
				
				<Stack sx={{ flex: 1, minWidth: 0 }}>
					<Typography 
						variant={size === 'small' ? 'subtitle1' : 'h6'}
						sx={{ 
							fontWeight: 600, 
							marginBottom: '8px',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical'
						}}
					>
						{boardArticle.articleTitle}
					</Typography>
					
					<Typography 
						variant="body2" 
						color="text.secondary"
						sx={{ 
							marginBottom: '12px',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							display: '-webkit-box',
							WebkitLineClamp: size === 'small' ? 2 : 3,
							WebkitBoxOrient: 'vertical'
						}}
					>
						{boardArticle.articleContent}
					</Typography>
					
					<Stack direction="row" spacing={2} alignItems="center">
						<Stack direction="row" spacing={1} alignItems="center">
							<VisibilityIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
							<Typography variant="caption" color="text.secondary">
								{boardArticle.articleViews || 0}
							</Typography>
						</Stack>
						
						<Stack direction="row" spacing={1} alignItems="center">
							<CommentIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
							<Typography variant="caption" color="text.secondary">
								{boardArticle.articleComments || 0}
							</Typography>
						</Stack>
						
						<Stack direction="row" spacing={1} alignItems="center">
							{boardArticle.meLiked && boardArticle.meLiked[0]?.myFavorite ? (
								<FavoriteIcon 
									sx={{ fontSize: '16px', color: 'primary.main', cursor: 'pointer' }}
									onClick={handleLikeClick}
								/>
							) : (
								<FavoriteBorderIcon 
									sx={{ fontSize: '16px', color: 'text.secondary', cursor: 'pointer' }}
									onClick={handleLikeClick}
								/>
							)}
							<Typography variant="caption" color="text.secondary">
								{boardArticle.articleLikes || 0}
							</Typography>
						</Stack>
						
						<Typography variant="caption" color="text.secondary" sx={{ marginLeft: 'auto' }}>
							{formatDate(boardArticle.createdAt)}
						</Typography>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityCard; 