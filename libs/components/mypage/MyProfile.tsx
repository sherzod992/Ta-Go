import React, { useState } from 'react';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { Paper, Stack, Avatar, TextField, Button, Typography } from '@mui/material';
import { updateUserInfo } from '../../auth';

const MyProfile: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [memberFullName, setMemberFullName] = useState(user?.memberFullName || '');
  const [memberDesc, setMemberDesc] = useState(user?.memberDesc || '');
  const [updateMember, { loading }] = useMutation(UPDATE_MEMBER);

  if (!user?._id) return null;

  const handleSave = async () => {
    const res = await updateMember({ variables: { input: { _id: user._id, memberFullName, memberDesc } } });
    const accessToken = res?.data?.updateMember?.accessToken;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      updateUserInfo(accessToken);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={user.memberImage} sx={{ width: 64, height: 64 }} />
          <Typography variant="h6">{user.memberNick}</Typography>
        </Stack>
        <TextField label="Full Name" value={memberFullName} onChange={(e) => setMemberFullName(e.target.value)} />
        <TextField label="Description" value={memberDesc} onChange={(e) => setMemberDesc(e.target.value)} multiline rows={4} />
        <Button variant="contained" onClick={handleSave} disabled={loading}>Save</Button>
      </Stack>
    </Paper>
  );
};

export default MyProfile;


