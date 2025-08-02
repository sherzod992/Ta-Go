import { gql } from "@apollo/client";

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
query getAllMembersByAdmin($input: MembersInquiry!) {
    getAllMembersByAdmin(input: $input) {
        list {
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
        metaCounter {
            total
        }
    }
}

`;

/**************************
 *        PROPERTY        *
 *************************/

export const GET_ALL_PROPERTIES_BY_ADMIN = gql`
  query GetAllPropertiesByAdmin($input: AllPropertiesInquiry!) {
    getAllPropertiesByAdmin(input: $input) {
        list {
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
            propertyBarter
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
            memberData {
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
        metaCounter {
            total
      }
    }
  }
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
  query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
    getAllBoardArticlesByAdmin(input: $input) {
      list {
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
        memberData {
            _id
            memberType
            memberStatus
            memberAuthType
            memberPhone
            memberNick
            memberFullName
            memberImage
            memberAddress
            memberDesc
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
      metaCounter {
        total
      }
    }
  }
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
  query GetComments($input: CommentsInquiry!) {
    getComments(input: $input) {
        list {
            _id
            commentStatus
            commentGroup
            commentContent
            commentRefId
            memberId
            createdAt
            updatedAt
            memberData {
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
        metaCounter {
            total
        }
    }
  }
`;
