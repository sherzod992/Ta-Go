import React, { useState } from 'react';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { Paper, Stack, Avatar, TextField, Button, Typography, Alert } from '@mui/material';
import { updateUserInfo } from '../../auth';
import { sweetMixinSuccessAlert } from '../../sweetAlert';

const MyProfile: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [memberFullName, setMemberFullName] = useState(user?.memberFullName || '');
  const [memberDesc, setMemberDesc] = useState(user?.memberDesc || '');
  const [updateMember, { loading }] = useMutation(UPDATE_MEMBER);
  const [successMessage, setSuccessMessage] = useState('');

  if (!user?._id) return null;

  const handleSave = async () => {
    try {
      const res = await updateMember({ 
        variables: { 
          input: { 
            _id: user._id, 
            memberFullName, 
            memberDesc 
          } 
        } 
      });
      
      const accessToken = res?.data?.updateMember?.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        updateUserInfo(accessToken);
        
        // 성공 메시지 표시
        await sweetMixinSuccessAlert('프로필이 성공적으로 저장되었습니다!');
        
        // 입력 필드 초기화
        setMemberFullName('');
        setMemberDesc('');
        
        // 성공 메시지 상태 업데이트
        setSuccessMessage('프로필이 성공적으로 저장되었습니다!');
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={user.memberImage} sx={{ width: 64, height: 64 }} />
          <Typography variant="h6">{user.memberNick}</Typography>
        </Stack>
        
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        
        <TextField 
          label="Full Name" 
          value={memberFullName} 
          onChange={(e) => setMemberFullName(e.target.value)}
          placeholder="실명을 입력하세요"
        />
        <TextField 
          label="Description" 
          value={memberDesc} 
          onChange={(e) => setMemberDesc(e.target.value)} 
          multiline 
          rows={4}
          placeholder="자기소개를 입력하세요"
        />
        <Button 
          variant="contained" 
          onClick={handleSave} 
          disabled={loading}
          sx={{ 
            minHeight: 48,
            fontWeight: 'bold'
          }}
        >
          {loading ? '저장 중...' : '저장하기'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default MyProfile;


