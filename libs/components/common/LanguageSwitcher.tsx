import React from 'react';
import { useTranslation } from 'next-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { 
  Menu, 
  MenuItem, 
  IconButton, 
  Typography,
  Box 
} from '@mui/material';
import { Language } from '@mui/icons-material';

const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation('common');
  const { currentLocale, changeLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (locale: string) => {
    changeLanguage(locale);
    handleClose();
  };

  const languages = [
    { code: 'ko', name: t('Korean') },
    { code: 'en', name: t('English') },
    { code: 'ja', name: t('Japanese') },
    { code: 'ru', name: t('Russian') },
  ];

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        sx={{ color: 'inherit' }}
        aria-label="language selection"
      >
        <Language />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={currentLocale === lang.code}
          >
            <Typography variant="body2">
              {lang.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;
