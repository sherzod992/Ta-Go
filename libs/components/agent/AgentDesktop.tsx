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
  Container,
  Stack,
  Alert,
  CircularProgress,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { GET_AGENTS, GET_MEMBER_PROPERTY_STATS, GET_MEMBER_PROPERTIES } from '../../../apollo/user/query';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { MemberType } from '../../enums/member.enum';
import { safeReload } from '../../utils/security';

const AgentDesktop: React.FC = () => {
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const [selectedAgentForProperties, setSelectedAgentForProperties] = useState<any>(null);
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000000]);

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

  // 각 agent의 매물 통계 정보를 가져오는 쿼리들
  const agentIds = data?.getAgents?.list?.map((agent: any) => agent._id) || [];
  
  const { data: statsData } = useQuery(GET_MEMBER_PROPERTY_STATS, {
    variables: { memberId: agentIds[0] || '' },
    skip: agentIds.length === 0,
    errorPolicy: 'all',
  });

  // 에이전트 데이터 처리
  const agents = useMemo(() => {
    if (!data?.getAgents?.list) return [];
    
    let filteredAgents = [...data.getAgents.list]; // 배열 복사본 생성

    // 전문분야 필터링
    if (selectedSpecialty) {
      filteredAgents = filteredAgents.filter((agent: any) => {
        return Array.isArray(agent.memberProperties) && agent.memberProperties.some((property: any) => 
          property.propertyType === selectedSpecialty
        );
      });
    }

    // 정렬 (안전한 배열 복사 후 정렬)
    const sortedAgents = [...filteredAgents];
    switch (sortBy) {
      case 'rating':
        sortedAgents.sort((a: any, b: any) => (b.memberRank || 0) - (a.memberRank || 0));
        break;
      case 'property-count':
        sortedAgents.sort((a: any, b: any) => {
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
        sortedAgents.sort((a: any, b: any) => (b.memberFollowers?.length || 0) - (a.memberFollowers?.length || 0));
        break;
      case 'name':
        sortedAgents.sort((a: any, b: any) => (a.memberFullName || '').localeCompare(b.memberFullName || ''));
        break;
      default:
        sortedAgents.sort((a: any, b: any) => (b.memberRank || 0) - (a.memberRank || 0));
    }

    return sortedAgents;
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="error" sx={{ fontSize: 60, opacity: 0.5 }} />
          </Box>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            일시적인 오류가 발생했습니다
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            에이전트 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => safeReload()}
          >
            다시 시도
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box className="agent-desktop">
      <Box sx={{ p: 3 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('Agents')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('Professional agents who have registered properties')} {agents.length}명을 찾았습니다
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* 사이드바 필터 */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                필터
              </Typography>
              
              <Stack spacing={3}>
                {/* 검색 */}
                <TextField
                  fullWidth
                  placeholder={t('Search by agent name or company')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />

                {/* 지역 필터 */}
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

                {/* 전문분야 필터 */}
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

                {/* 정렬 */}
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

                {/* 뷰 모드 */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    보기 모드
                  </Typography>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                    fullWidth
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
          </Grid>

          {/* 메인 콘텐츠 */}
          <Grid item xs={12} md={9}>
            {/* Agent 목록 */}
            <Grid container spacing={3}>
              {agents.map((agent: any) => (
                <Grid item xs={12} lg={viewMode === 'grid' ? 4 : 12} key={agent._id}>
                  <Card className="agent-card" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                        <Avatar
                          src={agent.memberImage}
                          sx={{ width: 80, height: 80 }}
                          className="agent-avatar"
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h5" component="h2">
                              {agent.memberFullName || agent.memberNick}
                            </Typography>
                            {agent.memberStatus === 'ACTIVE' && (
                              <VerifiedIcon color="primary" sx={{ fontSize: '1.5rem' }} />
                            )}
                          </Box>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            {agent.memberAddress}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Rating value={getAgentScore(agent) / 100} precision={0.1} readOnly />
                            <Typography variant="body1">
                              {getAgentScore(agent).toFixed(0)}점
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon />
                          <Typography variant="body1">{agent.memberAddress}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BikeIcon />
                          <Typography variant="body1">
                            매물 {(() => {
                              if (Array.isArray(agent.memberProperties)) {
                                return agent.memberProperties.length;
                              } else if (typeof agent.memberProperties === 'string') {
                                try {
                                  const parsed = JSON.parse(agent.memberProperties);
                                  return Array.isArray(parsed) ? parsed.length : 0;
                                } catch (e) {
                                  if (agent.memberProperties.includes(',')) {
                                    return agent.memberProperties.split(',').length;
                                  }
                                  return agent.memberProperties ? 1 : 0;
                                }
                              }
                              return 0;
                            })()}개
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon />
                          <Typography variant="body1">
                            팔로워 {(() => {
                              if (Array.isArray(agent.memberFollowers)) {
                                return agent.memberFollowers.length;
                              } else if (typeof agent.memberFollowers === 'string') {
                                try {
                                  const parsed = JSON.parse(agent.memberFollowers);
                                  return Array.isArray(parsed) ? parsed.length : 0;
                                } catch (e) {
                                  if (agent.memberFollowers.includes(',')) {
                                    return agent.memberFollowers.split(',').length;
                                  }
                                  return agent.memberFollowers ? 1 : 0;
                                }
                              }
                              return 0;
                            })()}명
                          </Typography>
                        </Box>
                      </Box>

                      {agent.memberDesc && (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                          {agent.memberDesc}
                        </Typography>
                      )}

                      <Box sx={{ mb: 3 }}>
                        {getAgentSpecialties(agent).map((specialty, index) => (
                          <Chip key={index} label={specialty} sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
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
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Box sx={{ mb: 3 }}>
                  <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
                </Box>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  아직 등록된 에이전트가 없습니다
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  현재 등록된 에이전트가 없습니다. 곧 새로운 에이전트들이 등록될 예정입니다.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => safeReload()}
                >
                  새로고침
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* 연락처 다이얼로그 */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>에이전트 연락처</DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar src={selectedAgent.memberImage} sx={{ width: 80, height: 80 }} />
                <Box>
                  <Typography variant="h4">{selectedAgent.memberFullName || selectedAgent.memberNick}</Typography>
                  <Typography variant="body1" color="text.secondary">{selectedAgent.memberAddress}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Rating value={getAgentScore(selectedAgent) / 100} precision={0.1} readOnly />
                    <Typography variant="body1">
                      {getAgentScore(selectedAgent).toFixed(0)}점
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    연락처 정보
                  </Typography>
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
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    활동 지표
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h4" color="primary">
                          {(() => {
                            if (Array.isArray(selectedAgent.memberProperties)) {
                              return selectedAgent.memberProperties.length;
                            } else if (typeof selectedAgent.memberProperties === 'string') {
                              try {
                                const parsed = JSON.parse(selectedAgent.memberProperties);
                                return Array.isArray(parsed) ? parsed.length : 0;
                              } catch (e) {
                                if (selectedAgent.memberProperties.includes(',')) {
                                  return selectedAgent.memberProperties.split(',').length;
                                }
                                return selectedAgent.memberProperties ? 1 : 0;
                              }
                            }
                            return 0;
                          })()}
                        </Typography>
                        <Typography variant="body1">등록 매물</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h4" color="primary">
                          {selectedAgent.memberFollowers?.length || 0}
                        </Typography>
                        <Typography variant="body1">팔로워</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h4" color="primary">
                          {selectedAgent.memberArticles?.length || 0}
                        </Typography>
                        <Typography variant="body1">게시글</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h4" color="primary">
                          {selectedAgent.memberViews || 0}
                        </Typography>
                        <Typography variant="body1">조회수</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {selectedAgent.memberDesc && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    소개
                  </Typography>
                  <Typography variant="body1">
                    {selectedAgent.memberDesc}
                  </Typography>
                </>
              )}
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
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={selectedAgentForProperties?.memberImage} sx={{ width: 50, height: 50 }} />
            <Box>
              <Typography variant="h5">
                {selectedAgentForProperties?.memberFullName || selectedAgentForProperties?.memberNick}의 매물
              </Typography>
              <Typography variant="body1" color="text.secondary">
                총 {(() => {
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={60} />
            </Box>
          ) : agentProperties?.getMemberProperties?.list?.length > 0 ? (
            <Grid container spacing={3}>
              {agentProperties.getMemberProperties.list.map((property: any) => (
                <Grid item xs={12} sm={6} md={4} key={property._id}>
                  <Card 
                    onClick={() => {
                      window.open(`/property/${property._id}`, '_blank');
                    }}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={property.propertyImages?.[0] || '/img/logo/Honda_Logo.svg'}
                      alt={property.propertyTitle}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1.1rem' }}>
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
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BikeIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5, mb: 3 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                등록된 매물이 없습니다
              </Typography>
              <Typography variant="body1" color="text.secondary">
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

export default AgentDesktop;
