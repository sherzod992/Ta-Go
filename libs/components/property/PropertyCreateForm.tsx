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

const PropertyCreateForm: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [createProperty, { loading }] = useMutation(CREATE_PROPERTY);
  
  const [registrationType, setRegistrationType] = useState<'normal' | 'advertisement'>('normal');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 폼 데이터 상태
  const [formData, setFormData] = useState<Partial<PropertyInput>>({
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
    propertyDesc: '',
    propertyBarter: false,
    propertyWarranty: false,
    propertyFinancing: false,
  });

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

  // 이미지 업로드 처리
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    if (images.length + newFiles.length > 10) {
      setError('최대 10개의 이미지만 업로드할 수 있습니다.');
      return;
    }

    setImages(prev => [...prev, ...newFiles]);
    
    // 미리보기 URL 생성
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 폼 데이터 변경 처리
  const handleInputChange = (field: keyof PropertyInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 폼 제출 처리
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    // 필수 필드 검증
    const requiredFields = [
      'propertyTitle',
      'propertyPrice',
      'propertyBrand',
      'propertyModel',
      'propertyAddress',
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof PropertyInput]) {
        setError(`${field}은(는) 필수 입력 항목입니다.`);
        return;
      }
    }

    if (images.length === 0) {
      setError('최소 1개의 이미지를 업로드해야 합니다.');
      return;
    }

    try {
      // 이미지를 base64로 변환 (실제로는 서버에 업로드해야 함)
      const imageBase64Array = await Promise.all(
        images.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const propertyData: PropertyInput = {
        ...formData as PropertyInput,
        propertyImages: imageBase64Array,
        memberId: user._id,
      };

      const result = await createProperty({
        variables: {
          input: propertyData,
        },
      });

      if (result.data?.createProperty) {
        setSuccess('매물이 성공적으로 등록되었습니다!');
        setTimeout(() => {
          router.push('/property?type=buy');
        }, 2000);
      }
    } catch (err) {
      setError('매물 등록 중 오류가 발생했습니다.');
      console.error('Property creation error:', err);
    }
  };

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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>오토바이 타입 *</InputLabel>
                <Select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  label="오토바이 타입 *"
                >
                  {Object.values(PropertyType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="주소 *"
                value={formData.propertyAddress}
                onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                required
              />
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
                label="브랜드 *"
                value={formData.propertyBrand}
                onChange={(e) => handleInputChange('propertyBrand', e.target.value)}
                required
              />
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
                label="연식"
                type="number"
                value={formData.propertyYear}
                onChange={(e) => handleInputChange('propertyYear', parseInt(e.target.value))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="주행거리 (km)"
                type="number"
                value={formData.propertyMileage}
                onChange={(e) => handleInputChange('propertyMileage', parseInt(e.target.value))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="엔진 크기 (cc)"
                type="number"
                value={formData.propertyEngineSize}
                onChange={(e) => handleInputChange('propertyEngineSize', parseInt(e.target.value))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="색상"
                value={formData.propertyColor}
                onChange={(e) => handleInputChange('propertyColor', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>연료 타입</InputLabel>
                <Select
                  value={formData.propertyFuelType}
                  onChange={(e) => handleInputChange('propertyFuelType', e.target.value)}
                  label="연료 타입"
                >
                  {Object.values(FuelType).map((fuel) => (
                    <MenuItem key={fuel} value={fuel}>
                      {fuel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>변속기</InputLabel>
                <Select
                  value={formData.propertyTransmission}
                  onChange={(e) => handleInputChange('propertyTransmission', e.target.value)}
                  label="변속기"
                >
                  {Object.values(TransmissionType).map((transmission) => (
                    <MenuItem key={transmission} value={transmission}>
                      {transmission}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select
                  value={formData.propertyCondition}
                  onChange={(e) => handleInputChange('propertyCondition', e.target.value)}
                  label="상태"
                >
                  {Object.values(ConditionType).map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 추가 옵션 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                추가 옵션
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.propertyBarter}
                    onChange={(e) => handleInputChange('propertyBarter', e.target.checked)}
                  />
                }
                label="물물교환 가능"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.propertyWarranty}
                    onChange={(e) => handleInputChange('propertyWarranty', e.target.checked)}
                  />
                }
                label="보증 가능"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.propertyFinancing}
                    onChange={(e) => handleInputChange('propertyFinancing', e.target.checked)}
                  />
                }
                label="할부 가능"
              />
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
                이미지 업로드 (최대 10개)
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
                    disabled={images.length >= 10}
                  >
                    이미지 업로드 ({images.length}/10)
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