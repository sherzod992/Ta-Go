import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
} from '@mui/material';
import { useMutation } from '@apollo/client';
import { CREATE_PROPERTY } from '../../../apollo/user/mutation';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import {
  PropertyType,
  PropertyLocation,
  FuelType,
  TransmissionType,
  ConditionType,
} from '../../enums/property.enum';
import { PropertyInput } from '../../types/property/property.input';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

// 오토바이 타입 이미지 매핑
const bikeTypeImages = {
  [PropertyType.ADVENTURE_TOURERS]: '/img/typeImages/ADVENTUREmoto.webp',
  [PropertyType.AGRICULTURE]: '/img/typeImages/AGRICULTUREmoto.png',
  [PropertyType.ALL_TERRAIN_VEHICLES]: '/img/typeImages/ALL_TERRAIN.jpg',
  [PropertyType.DIRT]: '/img/typeImages/dirtbike.avif',
  [PropertyType.ELECTRIC]: '/img/typeImages/electric.avif',
  [PropertyType.ENDURO]: '/img/typeImages/dirt-bikes.png',
  [PropertyType.MINI_BIKES]: '/img/typeImages/minibikes.jpg',
  [PropertyType.SXS_UTV]: '/img/typeImages/UTVbikes.avif',
};

// 변속기 이미지 매핑
const transmissionImages = {
  [TransmissionType.MANUAL]: '/img/typeImages/MANUAL.avif',
  [TransmissionType.AUTOMATIC]: '/img/typeImages/Automatic.webp',
  [TransmissionType.CVT]: '/img/typeImages/CVT.png',
};

// 연료 타입 이미지 매핑
const fuelTypeImages = {
  [FuelType.GASOLINE]: '/img/typeany/gasoline.png',
  [FuelType.ELECTRIC]: '/img/typeany/electric.png',
  [FuelType.HYBRID]: '/img/typeany/hybrid.png',
};

// 브랜드 로고 매핑
const brandLogos = {
  'Honda': '/img/logo/Honda_Logo.svg',
  'Yamaha': '/img/logo/yamaha.webp',
  'Suzuki': '/img/logo/suzuki.jpg',
  'Kawasaki': '/img/logo/kTm.jpeg',
  'BMW': '/img/logo/BMWMotorrad.jpg',
  'Ducati': '/img/logo/Ducati.webp',
  'Harley-Davidson': '/img/logo/PWcsAzP2m-HarleyDavidson.svg',
  'KTM': '/img/logo/kTm.jpeg',
  'Aprilia': '/img/logo/BAprilia.jpg',
  'MV Agusta': '/img/logo/MVAgusta.jpg',
  'Moto Guzzi': '/img/logo/MotoGuzzi.png',
  'Royal Enfield': '/img/logo/royalenfield.jpeg',
  'Bajaj': '/img/logo/Bajaj-logo.jpg',
  'TVS': '/img/logo/TVS Motor.png',
  'Hero': '/img/logo/Hero_MotoCorp.png',
};

// 색상 옵션
const colorOptions = [
  { name: '빨강', value: 'red', color: '#ff0000' },
  { name: '파랑', value: 'blue', color: '#0000ff' },
  { name: '검정', value: 'black', color: '#000000' },
  { name: '흰색', value: 'white', color: '#ffffff' },
  { name: '회색', value: 'gray', color: '#808080' },
  { name: '노랑', value: 'yellow', color: '#ffff00' },
  { name: '초록', value: 'green', color: '#008000' },
  { name: '주황', value: 'orange', color: '#ffa500' },
  { name: '보라', value: 'purple', color: '#800080' },
  { name: '갈색', value: 'brown', color: '#a52a2a' },
];

// 상태별 별점 매핑
const conditionRatingMap = {
  [ConditionType.EXCELLENT]: 5,
  [ConditionType.GOOD]: 4,
  [ConditionType.FAIR]: 3,
  [ConditionType.POOR]: 2,
};

const ratingConditionMap = {
  5: ConditionType.EXCELLENT,
  4: ConditionType.GOOD,
  3: ConditionType.FAIR,
  2: ConditionType.POOR,
};

const PropertyCreateForm: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [createProperty, { loading }] = useMutation(CREATE_PROPERTY);
  
  const [registrationType, setRegistrationType] = useState<'normal' | 'advertisement'>('normal');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 선택 상태 관리
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedBikeType, setSelectedBikeType] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [showMoreBrands, setShowMoreBrands] = useState(false);

  // 폼 데이터 상태 - memberId를 제외한 필드만 포함
  const [formData, setFormData] = useState({
    propertyType: PropertyType.ADVENTURE_TOURERS,
    propertyLocation: PropertyLocation.SEOUL,
    propertyAddress: '',
    propertyTitle: '',
    propertyPrice: 0,
    propertyBrand: '',
    propertyModel: '',
    propertyYear: new Date().getFullYear(),
    propertyMileage: 0,
    propertyEngineSize: 0,
    propertyFuelType: FuelType.GASOLINE,
    propertyTransmission: TransmissionType.MANUAL,
    propertyColor: '',
    propertyCondition: ConditionType.GOOD,
    propertyImages: [] as string[],
    propertyDesc: '',
  });

  // 토큰 디버깅
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  console.log('Current user:', user);
  console.log('Current token:', token);
  console.log('User ID exists:', !!user?._id);

  // 로그인 체크
  if (!user?._id) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="warning">
          매물을 등록하려면 로그인이 필요합니다.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/login')}
          sx={{ mt: 2 }}
        >
          로그인하기
        </Button>
      </Box>
    );
  }

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    console.log('No token found, redirecting to login');
    router.push('/login');
    return null;
  }

  // 이미지 압축 함수
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 최대 크기 설정 (400x300으로 더 작게)
        const maxWidth = 400;
        const maxHeight = 300;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.5); // 50% 품질로 더 압축
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    if (images.length + newFiles.length > 3) {
      setError('최대 3개의 이미지만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 검증 (각 파일 최대 500KB)
    for (const file of newFiles) {
      if (file.size > 500 * 1024) {
        setError('각 이미지 파일은 500KB 이하여야 합니다.');
        return;
      }
    }

    try {
      // 이미지 압축
      const compressedFiles = await Promise.all(
        newFiles.map(file => compressImage(file))
      );

      setImages(prev => [...prev, ...compressedFiles]);
      
      // 미리보기 URL 생성
      compressedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImageUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      setError('이미지 처리 중 오류가 발생했습니다.');
      console.error('Image processing error:', error);
    }
  };

  // 이미지 삭제
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 폼 데이터 변경 처리
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 색상 선택 처리
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    handleInputChange('propertyColor', color);
  };

  // 오토바이 타입 선택 처리
  const handleBikeTypeSelect = (type: string) => {
    setSelectedBikeType(type);
    handleInputChange('propertyType', type);
  };

  // 변속기 선택 처리
  const handleTransmissionSelect = (transmission: string) => {
    setSelectedTransmission(transmission);
    handleInputChange('propertyTransmission', transmission);
  };

  // 연료 타입 선택 처리
  const handleFuelTypeSelect = (fuelType: string) => {
    setSelectedFuelType(fuelType);
    handleInputChange('propertyFuelType', fuelType);
  };

  // 폼 제출 처리
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    // 필수 필드 검증
    const requiredFields = [
      { field: 'propertyTitle', label: '매물 제목' },
      { field: 'propertyPrice', label: '가격' },
      { field: 'propertyBrand', label: '브랜드' },
      { field: 'propertyModel', label: '모델' },
      { field: 'propertyAddress', label: '상세 주소' },
      { field: 'propertyYear', label: '연식' },
      { field: 'propertyMileage', label: '주행거리' },
      { field: 'propertyEngineSize', label: '엔진 크기' },
      { field: 'propertyColor', label: '색상' },
    ];

    for (const { field, label } of requiredFields) {
      const value = formData[field as keyof PropertyInput];
      if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && value <= 0)) {
        setError(`${label}은(는) 필수 입력 항목입니다.`);
        return;
      }
    }

    // 이미지 개수 제한 (최대 3개로 제한)
    if (images.length > 3) {
      setError('최대 3개의 이미지만 업로드할 수 있습니다.');
      return;
    }

    try {
      // formData 디버깅
      console.log('Original formData:', formData);
      
      // memberId를 제거하고 전송 (Backend에서 자동 설정)
      const { memberId, ...formDataWithoutMemberId } = formData as any;
      const inputData = {
        ...formDataWithoutMemberId,
        propertyImages: [] as string[],
      };

      console.log('Sending property data:', inputData);

      const result = await createProperty({
        variables: {
          input: inputData,
        },
      });

      if (result.data?.createProperty) {
        setSuccess('매물이 성공적으로 등록되었습니다! (이미지는 별도 업로드가 필요합니다)');
        setTimeout(() => {
          router.push('/property?type=buy');
        }, 2000);
      }
    } catch (err) {
      setError('매물 등록 중 오류가 발생했습니다.');
      console.error('Property creation error:', err);
    }
  };

  // 브랜드 목록을 6개씩 나누기
  const brandEntries = Object.entries(brandLogos);
  const visibleBrands = showMoreBrands ? brandEntries : brandEntries.slice(0, 6);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        매물 등록
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* 등록 타입 선택 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          등록 타입 선택
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: registrationType === 'normal' ? '2px solid #1976d2' : '1px solid #ddd',
                backgroundColor: registrationType === 'normal' ? '#f3f8ff' : 'white',
              }}
              onClick={() => setRegistrationType('normal')}
            >
              <CardContent>
                <Typography variant="h6">일반 등록</Typography>
                <Typography variant="body2" color="text.secondary">
                  기본적인 매물 등록
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: registrationType === 'advertisement' ? '2px solid #1976d2' : '1px solid #ddd',
                backgroundColor: registrationType === 'advertisement' ? '#f3f8ff' : 'white',
              }}
              onClick={() => setRegistrationType('advertisement')}
            >
              <CardContent>
                <Typography variant="h6">광고 등록</Typography>
                <Typography variant="body2" color="text.secondary">
                  상단 노출 및 프리미엄 기능
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 매물 등록 폼 */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 기본 정보 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                기본 정보
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="매물 제목 *"
                value={formData.propertyTitle}
                onChange={(e) => handleInputChange('propertyTitle', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="가격 *"
                type="number"
                value={formData.propertyPrice}
                onChange={(e) => handleInputChange('propertyPrice', parseInt(e.target.value))}
                required
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₩</span>,
                }}
              />
            </Grid>

            {/* 오토바이 타입 선택 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                오토바이 타입 *
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(bikeTypeImages).map(([type, image]) => (
                  <Grid item xs={3} sm={2} md={1.5} key={type}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: formData.propertyType === type ? '3px solid #1976d2' : '1px solid #ddd',
                        backgroundColor: formData.propertyType === type ? '#f3f8ff' : 'white',
                        transition: 'all 0.3s ease',
                        transform: selectedBikeType && selectedBikeType !== type ? 'scale(0.8) opacity(0.3)' : 'scale(1) opacity(1)',
                        '&:hover': {
                          borderColor: '#1976d2',
                          transform: selectedBikeType && selectedBikeType !== type ? 'scale(0.8) opacity(0.3)' : 'scale(1.05)',
                        },
                      }}
                      onClick={() => handleBikeTypeSelect(type)}
                    >
                      <CardContent sx={{ p: 0.5, textAlign: 'center' }}>
                        <img
                          src={image}
                          alt={type}
                          style={{
                            width: '100%',
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                          {type.replace(/_/g, ' ')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>지역 *</InputLabel>
                <Select
                  value={formData.propertyLocation}
                  onChange={(e) => handleInputChange('propertyLocation', e.target.value)}
                  label="지역 *"
                >
                  {Object.values(PropertyLocation).map((location) => (
                    <MenuItem key={location} value={location}>
                      {location.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="상세 주소 *"
                value={formData.propertyAddress}
                onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                placeholder="예: 강남구 테헤란로 123"
                required
              />
            </Grid>

            {/* 브랜드 선택 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                브랜드 *
              </Typography>
              <Grid container spacing={1}>
                {visibleBrands.map(([brand, logo]) => (
                  <Grid item xs={2} key={brand}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        border: formData.propertyBrand === brand ? '3px solid #1976d2' : '2px solid #ddd',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          borderColor: '#1976d2',
                        },
                        overflow: 'hidden',
                      }}
                      onClick={() => handleInputChange('propertyBrand', brand)}
                      title={brand}
                    >
                      <img
                        src={logo}
                        alt={brand}
                        style={{
                          width: '80%',
                          height: '80%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: '0.7rem' }}>
                      {brand}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              {brandEntries.length > 6 && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowMoreBrands(!showMoreBrands)}
                  sx={{ mt: 1 }}
                >
                  {showMoreBrands ? '접기' : `더보기 (${brandEntries.length - 6}개 더)`}
                </Button>
              )}
            </Grid>

            {/* 오토바이 상세 정보 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                오토바이 상세 정보
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="모델 *"
                value={formData.propertyModel}
                onChange={(e) => handleInputChange('propertyModel', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="연식 *"
                type="number"
                value={formData.propertyYear}
                onChange={(e) => handleInputChange('propertyYear', parseInt(e.target.value))}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="주행거리 (km) *"
                type="number"
                value={formData.propertyMileage}
                onChange={(e) => handleInputChange('propertyMileage', parseInt(e.target.value))}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="엔진 크기 (cc) *"
                type="number"
                value={formData.propertyEngineSize}
                onChange={(e) => handleInputChange('propertyEngineSize', parseInt(e.target.value))}
                required
              />
            </Grid>

            {/* 색상 선택 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                색상 *
              </Typography>
              <Grid container spacing={1}>
                {colorOptions.map((color) => (
                  <Grid item key={color.value}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: color.color,
                        border: formData.propertyColor === color.value ? '3px solid #1976d2' : '2px solid #ddd',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        transform: selectedColor && selectedColor !== color.value ? 'scale(0.8) opacity(0.3)' : 'scale(1) opacity(1)',
                        '&:hover': {
                          transform: selectedColor && selectedColor !== color.value ? 'scale(0.8) opacity(0.3)' : 'scale(1.1)',
                        },
                      }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* 연료 타입 선택 */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                연료 타입
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(fuelTypeImages).map(([fuelType, image]) => (
                  <Grid item xs={4} key={fuelType}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: formData.propertyFuelType === fuelType ? '3px solid #1976d2' : '1px solid #ddd',
                        backgroundColor: formData.propertyFuelType === fuelType ? '#f3f8ff' : 'white',
                        transition: 'all 0.3s ease',
                        transform: selectedFuelType && selectedFuelType !== fuelType ? 'scale(0.8) opacity(0.3)' : 'scale(1) opacity(1)',
                        '&:hover': {
                          borderColor: '#1976d2',
                          transform: selectedFuelType && selectedFuelType !== fuelType ? 'scale(0.8) opacity(0.3)' : 'translateY(-2px)',
                        },
                      }}
                      onClick={() => handleFuelTypeSelect(fuelType)}
                    >
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <img
                          src={image}
                          alt={fuelType}
                          style={{
                            width: '100%',
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                          {fuelType}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* 변속기 선택 */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                변속기
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(transmissionImages).map(([transmission, image]) => (
                  <Grid item xs={4} key={transmission}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: formData.propertyTransmission === transmission ? '3px solid #1976d2' : '1px solid #ddd',
                        backgroundColor: formData.propertyTransmission === transmission ? '#f3f8ff' : 'white',
                        transition: 'all 0.3s ease',
                        transform: selectedTransmission && selectedTransmission !== transmission ? 'scale(0.8) opacity(0.3)' : 'scale(1) opacity(1)',
                        '&:hover': {
                          borderColor: '#1976d2',
                          transform: selectedTransmission && selectedTransmission !== transmission ? 'scale(0.8) opacity(0.3)' : 'translateY(-2px)',
                        },
                      }}
                      onClick={() => handleTransmissionSelect(transmission)}
                    >
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <img
                          src={image}
                          alt={transmission}
                          style={{
                            width: '100%',
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                          {transmission}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* 상태 선택 */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                상태
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  value={conditionRatingMap[formData.propertyCondition as ConditionType] || 0}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      handleInputChange('propertyCondition', ratingConditionMap[newValue as keyof typeof ratingConditionMap]);
                    }
                  }}
                  max={4}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  {formData.propertyCondition?.replace(/_/g, ' ')}
                </Typography>
              </Box>
            </Grid>

            {/* 추가 옵션 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                추가 옵션
              </Typography>
            </Grid>



            {/* 상세 설명 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="상세 설명"
                multiline
                rows={4}
                value={formData.propertyDesc}
                onChange={(e) => handleInputChange('propertyDesc', e.target.value)}
              />
            </Grid>

            {/* 이미지 업로드 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                이미지 업로드 (선택사항, 최대 3개)
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={images.length >= 3}
                  >
                    이미지 업로드 ({images.length}/3)
                  </Button>
                </label>
              </Box>

              {/* 이미지 미리보기 */}
              <Grid container spacing={2}>
                {imageUrls.map((url, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* 제출 버튼 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? <CircularProgress size={24} /> : '매물 등록하기'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.back()}
                  sx={{ minWidth: 200 }}
                >
                  취소
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
  };
  
export default PropertyCreateForm; 