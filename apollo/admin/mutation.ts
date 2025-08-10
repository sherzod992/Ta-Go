import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
mutation UpdateMemberByAdmin($input:MemberUpdate!) {
    updateMemberByAdmin(input:$input) {
        _id
        memberType
        memberStatus
        memberAuthType
        memberPhone
        memberEmail
        memberNick
        memberFullName
        memberImage
        memberAddress
        memberDesc
        socialId
        socialProvider
        socialAccessToken
        socialRefreshToken
        socialTokenExpiresAt
        memberProperties
        memberArticles
        memberFollowers
        memberFollowings
        memberPoints
        memberLikes
        memberViews
        memberComments
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
    }
}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const UPDATE_PROPERTY_BY_ADMIN = gql`
	mutation UpdatePropertyByAdmin($input: PropertyUpdate!) {
		updatePropertyByAdmin(input: $input) {
        _id
        propertyType
        propertyStatus
        propertyLocation
        propertyAddress
        propertyTitle
        propertyPrice
        propertyBrand
        propertyModel
        propertyYear
        propertyMileage
        propertyEngineSize
        propertyFuelType
        propertyTransmission
        propertyColor
        propertyCondition
        propertyViews
        propertyLikes
        propertyComments
        propertyRank
        propertyImages
        propertyDesc
        propertyRent
        propertyFinancing
        propertyWarranty
        memberId
        soldAt
        deletedAt
        manufacturedAt
        lastInspectionAt
        nextInspectionAt
        createdAt
        updatedAt
		}
	}
`;

export const REMOVE_PROPERTY_BY_ADMIN = gql`
	mutation RemovePropertyByAdmin($input: String!) {
		removePropertyByAdmin(propertyId: $input) {
			_id
			propertyType
			propertyStatus
			propertyLocation
			propertyAddress
			propertyTitle
			propertyPrice
			propertyBrand
			propertyModel
			propertyYear
			propertyMileage
			propertyEngineSize
			propertyFuelType
			propertyTransmission
			propertyColor
			propertyCondition
			propertyViews
			propertyLikes
			propertyComments
			propertyRank
			            propertyImages
            propertyDesc
            propertyRent
            propertyFinancing
            propertyWarranty
			memberId
			soldAt
			deletedAt
			manufacturedAt
			lastInspectionAt
			nextInspectionAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
mutation RemoveBoardArticleByAdmin($input: String!) {
    removeBoardArticleByAdmin(articleId: $input) {
        _id
        articleCategory
        articleStatus
        articleTitle
        articleContent
        articleImage
        articleViews
        articleLikes
        articleComments
        memberId
        createdAt
        updatedAt
    }
}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
		}
	}
`;
