import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Avatar,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Drawer,
  IconButton,
  Container,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  DirectionsBike as BikeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Message as MessageIcon,
  Verified as VerifiedIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { GET_AGENTS, GET_MEMBER_PROPERTY_STATS, GET_MEMBER_PROPERTIES } from '../../../apollo/user/query';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { MemberType } from '../../enums/member.enum';
import { safeReload } from '../../utils/security';

const AgentMobile: React.FC = () => {
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const [selectedAgentForProperties, setSelectedAgentForProperties] = useState<any>(null);

  // GraphQL 쿼리
  const { data, loading, error } = useQuery(GET_AGENTS, {
    variables: {
      input: {
        page: 1,
        limit: 50,
        search: {
          keyword: searchTerm,
          location: selectedLocation || undefined,
          memberType: MemberType.AGENT,
        },
      },
    },
    errorPolicy: 'all',
  });

  // 선택된 에이전트의 매물 가져오기
  const { data: agentProperties, loading: propertiesLoading } = useQuery(GET_MEMBER_PROPERTIES, {
    variables: {
      targetMemberId: selectedAgentForProperties?._id || '',
      page: 1,
      limit: 20,
    },
    skip: !selectedAgentForProperties?._id,
    errorPolicy: 'all',
  });

  // 선택된 에이전트의 매물 통계 가져오기
  const { data: agentPropertyStats } = useQuery(GET_MEMBER_PROPERTY_STATS, {
    variables: {
      memberId: selectedAgentForProperties?._id || '',
    },
    skip: !selectedAgentForProperties?._id,
    errorPolicy: 'all',
  });

  // 에이전트 데이터 처리
  const agents = useMemo(() => {
    if (!data?.getAgents?.list) return [];
    
    // 디버깅을 위한 로그
    console.log('Agents data:', data.getAgents.list);
    console.log('First agent:', data.getAgents.list[0]);
    console.log('First agent memberProperties:', data.getAgents.list[0]?.memberProperties);
    console.log('First agent memberProperties type:', typeof data.getAgents.list[0]?.memberProperties);
    console.log('First agent memberProperties isArray:', Array.isArray(data.getAgents.list[0]?.memberProperties));
    console.log('First agent memberProperties length:', data.getAgents.list[0]?.memberProperties?.length);
    console.log('First agent memberProperties stringified:', JSON.stringify(data.getAgents.list[0]?.memberProperties));
    
    let filteredAgents = [...data.getAgents.list]; // 배열 복사본 생성

    // 전문분야 필터링
    if (selectedSpecialty) {
      filteredAgents = filteredAgents.filter((agent: any) => {
        // 에이전트의 매물에서 전문분야 확인
        return Array.isArray(agent.memberProperties) && agent.memberProperties.some((property: any) => 
          property.propertyType === selectedSpecialty
        );
      });
    }

    // 정렬
    switch (sortBy) {
      case 'rating':
        filteredAgents.sort((a: any, b: any) => (b.memberRank || 0) - (a.memberRank || 0));
        break;
      case 'property-count':
        filteredAgents.sort((a: any, b: any) => {
          const getPropertyCount = (agent: any) => {
            if (Array.isArray(agent.memberProperties)) {
              return agent.memberProperties.length;
            } else if (typeof agent.memberProperties === 'string') {
              try {
                const parsed = JSON.parse(agent.memberProperties);
                return Array.isArray(parsed) ? parsed.length : 0;
              } catch (e) {
                return 0;
              }
            }
            return 0;
          };
          return getPropertyCount(b) - getPropertyCount(a);
        });
        break;
      case 'follower-count':
        filteredAgents.sort((a: any, b: any) => {
          const getFollowerCount = (agent: any) => {
            if (Array.isArray(agent.memberFollowers)) {
              return agent.memberFollowers.length;
            } else if (typeof agent.memberFollowers === 'string') {
              try {
                const parsed = JSON.parse(agent.memberFollowers);
                return Array.isArray(parsed) ? parsed.length : 0;
              } catch (e) {
                return 0;
              }
            }
            return 0;
          };
          return getFollowerCount(b) - getFollowerCount(a);
        });
        break;
      case 'name':
        filteredAgents.sort((a: any, b: any) => (a.memberFullName || '').localeCompare(b.memberFullName || ''));
        break;
      default:
        filteredAgents.sort((a: any, b: any) => (b.memberRank || 0) - (a.memberRank || 0));
    }

    return filteredAgents;
  }, [data, selectedSpecialty, sortBy]);

  const handleContact = (agent: any) => {
    setSelectedAgent(agent);
    setContactDialogOpen(true);
  };

  const handleViewProperties = (agent: any) => {
    console.log('Selected agent for properties:', agent);
    setSelectedAgentForProperties(agent);
    setPropertiesModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ko-KR').format(mileage) + 'km';
  };

  const getAgentScore = (agent: any) => {
    let propertyCount = 0;
    let articleCount = 0;
    let followerCount = 0;
    
    // memberProperties 처리
    if (Array.isArray(agent.memberProperties)) {
      propertyCount = agent.memberProperties.length;
    } else if (typeof agent.memberProperties === 'string') {
      try {
        const parsed = JSON.parse(agent.memberProperties);
        propertyCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch (e) {
        propertyCount = 0;
      }
    }
    
    // memberArticles 처리
    if (Array.isArray(agent.memberArticles)) {
      articleCount = agent.memberArticles.length;
    } else if (typeof agent.memberArticles === 'string') {
      try {
        const parsed = JSON.parse(agent.memberArticles);
        articleCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch (e) {
        articleCount = 0;
      }
    }
    
    // memberFollowers 처리
    if (Array.isArray(agent.memberFollowers)) {
      followerCount = agent.memberFollowers.length;
    } else if (typeof agent.memberFollowers === 'string') {
      try {
        const parsed = JSON.parse(agent.memberFollowers);
        followerCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch (e) {
        followerCount = 0;
      }
    }
    
    const likeCount = agent.memberLikes || 0;
    const viewCount = agent.memberViews || 0;
    
    return propertyCount * 10 + articleCount * 5 + followerCount * 2 + likeCount + viewCount * 0.1;
  };

  const getAgentSpecialties = (agent: any) => {
    if (!agent.memberProperties || !Array.isArray(agent.memberProperties)) return [];
    
    const typeCounts: { [key: string]: number } = {};
    agent.memberProperties.forEach((property: any) => {
      const type = property.propertyType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  };

  const locations = Object.values(PropertyLocation);
  const specialties = Object.values(PropertyType);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          에이전트 정보를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="error" sx={{ fontSize: 50, opacity: 0.5 }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            일시적인 오류가 발생했습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            에이전트 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            size="small"
            onClick={() => safeReload()}
          >
            다시 시도
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box className="agent-mobile">
      {/* 헤더 */}
      <Box sx={{ p: 2, backgroundColor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('Agents')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Professional agents who have registered properties')} {agents.length}명을 찾았습니다
        </Typography>
      </Box>

      {/* 검색 및 필터 바 */}
      <Paper sx={{ m: 2, p: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder={t('Search by agent name or company')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ flex: 1 }}
            >
              필터
            </Button>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="grid">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </Paper>

      {/* Agent 목록 */}
      <Container maxWidth="sm" sx={{ pb: 4 }}>
        <Grid container spacing={2}>
          {agents.map((agent: any) => (
            <Grid item xs={12} key={agent._id}>
              <Card className="agent-card">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar
                      src={agent.memberImage}
                      sx={{ width: 60, height: 60 }}
                      className="agent-avatar"
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" component="h2">
                          {agent.memberFullName || agent.memberNick}
                        </Typography>
                        {agent.memberStatus === 'ACTIVE' && (
                          <VerifiedIcon color="primary" sx={{ fontSize: '1.2rem' }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {agent.memberAddress}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Rating value={getAgentScore(agent) / 100} precision={0.1} size="small" readOnly />
                        <Typography variant="body2">
                          {getAgentScore(agent).toFixed(0)}점
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 'small' }} />
                      <Typography variant="body2">{agent.memberAddress}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BikeIcon sx={{ fontSize: 'small' }} />
                      <Typography variant="body2">
                        매물 {(() => {
                          // memberProperties가 배열인 경우
                          if (Array.isArray(agent.memberProperties)) {
                            return agent.memberProperties.length;
                          }
                          // memberProperties가 문자열인 경우 (JSON 문자열일 수 있음)
                          else if (typeof agent.memberProperties === 'string') {
                            try {
                              const parsed = JSON.parse(agent.memberProperties);
                              return Array.isArray(parsed) ? parsed.length : 0;
                            } catch (e) {
                              // JSON 파싱 실패 시 문자열 길이로 판단 (쉼표로 구분된 ID들일 수 있음)
                              if (agent.memberProperties.includes(',')) {
                                return agent.memberProperties.split(',').length;
                              }
                              return agent.memberProperties ? 1 : 0;
                            }
                          }
                          // memberProperties가 null, undefined, 또는 다른 타입인 경우
                          return 0;
                        })()}개
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 'small' }} />
                      <Typography variant="body2">
                        팔로워 {(() => {
                          // memberFollowers가 배열인 경우
                          if (Array.isArray(agent.memberFollowers)) {
                            return agent.memberFollowers.length;
                          }
                          // memberFollowers가 문자열인 경우 (JSON 문자열일 수 있음)
                          else if (typeof agent.memberFollowers === 'string') {
                            try {
                              const parsed = JSON.parse(agent.memberFollowers);
                              return Array.isArray(parsed) ? parsed.length : 0;
                            } catch (e) {
                              // JSON 파싱 실패 시 문자열 길이로 판단 (쉼표로 구분된 ID들일 수 있음)
                              if (agent.memberFollowers.includes(',')) {
                                return agent.memberFollowers.split(',').length;
                              }
                              return agent.memberFollowers ? 1 : 0;
                            }
                          }
                          // memberFollowers가 null, undefined, 또는 다른 타입인 경우
                          return 0;
                        })()}명
                      </Typography>
                    </Box>
                  </Box>

                  {agent.memberDesc && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {agent.memberDesc}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    {getAgentSpecialties(agent).map((specialty, index) => (
                      <Chip key={index} label={specialty} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<MessageIcon />}
                      onClick={() => handleContact(agent)}
                      sx={{ flex: 1 }}
                      className="contact-btn"
                    >
                      연락하기
                    </Button>
                    <Button 
                      variant="outlined" 
                      sx={{ flex: 1 }} 
                      className="properties-btn"
                      onClick={() => handleViewProperties(agent)}
                    >
                      매물보기
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {agents.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Box sx={{ mb: 2 }}>
              <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              아직 등록된 에이전트가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              현재 등록된 에이전트가 없습니다. 곧 새로운 에이전트들이 등록될 예정입니다.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              size="small"
              onClick={() => safeReload()}
            >
              새로고침
            </Button>
          </Box>
        )}
      </Container>

      {/* 필터 드로어 */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16 }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">필터</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>지역</InputLabel>
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                label="지역"
              >
                <MenuItem value="">전체</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>전문분야</InputLabel>
              <Select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                label="전문분야"
              >
                <MenuItem value="">전체</MenuItem>
                {specialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>정렬</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="정렬"
              >
                <MenuItem value="rating">평점순</MenuItem>
                <MenuItem value="property-count">매물수순</MenuItem>
                <MenuItem value="follower-count">팔로워순</MenuItem>
                <MenuItem value="name">이름순</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              fullWidth
            >
              적용
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* 연락처 다이얼로그 */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>에이전트 연락처</DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar src={selectedAgent.memberImage} sx={{ width: 60, height: 60 }} />
                <Box>
                  <Typography variant="h6">{selectedAgent.memberFullName || selectedAgent.memberNick}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedAgent.memberAddress}</Typography>
                </Box>
              </Box>
              
              <List>
                {selectedAgent.memberPhone && (
                  <ListItem>
                    <ListItemAvatar>
                      <PhoneIcon />
                    </ListItemAvatar>
                    <ListItemText primary="전화번호" secondary={selectedAgent.memberPhone} />
                  </ListItem>
                )}
                {selectedAgent.memberEmail && (
                  <ListItem>
                    <ListItemAvatar>
                      <EmailIcon />
                    </ListItemAvatar>
                    <ListItemText primary="이메일" secondary={selectedAgent.memberEmail} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemAvatar>
                    <LocationIcon />
                  </ListItemAvatar>
                  <ListItemText primary="위치" secondary={selectedAgent.memberAddress} />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                활동 지표
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary">
                                              {selectedAgent.memberProperties?.length || 0}
                    </Typography>
                    <Typography variant="body2">등록 매물</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary">
                                              {selectedAgent.memberFollowers?.length || 0}
                    </Typography>
                    <Typography variant="body2">팔로워</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 매물 보기 모달 */}
      <Dialog 
        open={propertiesModalOpen} 
        onClose={() => setPropertiesModalOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={selectedAgentForProperties?.memberImage} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant="h6">
                {selectedAgentForProperties?.memberFullName || selectedAgentForProperties?.memberNick}의 매물
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 {(() => {
                  console.log('Agent properties data:', agentProperties);
                  console.log('Agent property stats:', agentPropertyStats);
                  console.log('Meta counter:', agentProperties?.getMemberProperties?.metaCounter);
                  console.log('List length:', agentProperties?.getMemberProperties?.list?.length);
                  
                  // 통계 데이터가 있으면 우선 사용, 없으면 매물 목록의 메타 카운터 또는 리스트 길이 사용
                  return agentPropertyStats?.getMemberPropertyStats?.totalProperties || 
                         agentProperties?.getMemberProperties?.metaCounter?.total || 
                         agentProperties?.getMemberProperties?.list?.length || 0;
                })()}개의 매물
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {propertiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : agentProperties?.getMemberProperties?.list?.length > 0 ? (
            <Grid container spacing={2}>
              {agentProperties.getMemberProperties.list.map((property: any) => (
                <Grid item xs={12} sm={6} key={property._id}>
                  <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => {
                    window.open(`/property/${property._id}`, '_blank');
                  }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={property.propertyImages?.[0] || '/img/logo/Honda_Logo.svg'}
                      alt={property.propertyTitle}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem' }}>
                        {property.propertyTitle}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {formatPrice(property.propertyPrice)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 'small' }} />
                        <Typography variant="body2" color="text.secondary">
                          {property.propertyLocation}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {property.propertyYear}년
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatMileage(property.propertyMileage)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BikeIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                등록된 매물이 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                이 에이전트는 아직 매물을 등록하지 않았습니다.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPropertiesModalOpen(false)}>닫기</Button>
          {(agentPropertyStats?.getMemberPropertyStats?.totalProperties || agentProperties?.getMemberProperties?.metaCounter?.total || 0) > 20 && (
            <Button 
              variant="contained" 
              onClick={() => {
                window.open(`/property?memberId=${selectedAgentForProperties?._id}`, '_blank');
              }}
            >
              모든 매물 보기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentMobile;
