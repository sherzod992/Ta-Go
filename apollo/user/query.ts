import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
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
            meLiked
        }
        metaCounter {
            total
        }
		}
	}
`;

export const GET_MEMBER = gql`
  query GetMember($input: String!) {
    getMember(memberId: $input) {
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
`;

export const GET_MEMBER_PROPERTIES = gql`
  query GetMemberProperties($targetMemberId: String!, $page: Int, $limit: Int) {
    getMemberProperties(targetMemberId: $targetMemberId, page: $page, limit: $limit) {
      list {
        _id
        propertyTitle
        propertyPrice
        propertyBrand
        propertyModel
        propertyYear
        propertyMileage
        propertyLocation
        propertyStatus
        propertyViews
        propertyLikes
        propertyImages
        meLiked
        createdAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_MEMBER_PROPERTY_STATS = gql`
  query GetMemberPropertyStats($memberId: String!) {
    getMemberPropertyStats(memberId: $memberId) {
      totalProperties
      activeProperties
      soldProperties
      totalViews
      totalLikes
    }
  }
`;

/**************************
 *        PROPERTY        *
 *************************/

export const GET_PROPERTY = gql`
	query GetProperty($input: String!) {
		getProperty(propertyId: $input) {
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
			propertyWarranty
			propertyFinancing
			memberId
			soldAt
			deletedAt
			manufacturedAt
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
			meLiked
		}
	}
`;

export const GET_PROPERTIES = gql`
	query GetProperties($input: PropertiesInquiry!) {
		getProperties(input: $input) {
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
            propertyWarranty
            propertyFinancing
            memberId
            soldAt
            deletedAt
            manufacturedAt
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
            meLiked
        }
        metaCounter {
            total
        }
		}
	}
`;

export const GET_AGENT_PROPERTIES = gql`
	query GetAgentProperties($input: AgentPropertiesInquiry!) {
		getAgentProperties(input: $input) {
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
				propertyImages
				propertyDesc
				propertyWarranty
				propertyFinancing
				memberId
				soldAt
				deletedAt
				manufacturedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
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
				propertyWarranty
				propertyFinancing
				memberId
				soldAt
				deletedAt
				manufacturedAt
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

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
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
				propertyWarranty
				propertyFinancing
				memberId
				soldAt
				deletedAt
				manufacturedAt
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

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
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
            meLiked
		}
	}
}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
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
				meLiked
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

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
            _id
            followingId
            followerId
            createdAt
            updatedAt
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            meFollowed {
                followingId
                followerId
                myFollowing
            }
            followerData {
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

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					meLiked
					meFollowed {
						followingId
						followerId
						myFollowing
					}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
