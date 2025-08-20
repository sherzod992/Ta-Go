import React from 'react';
import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const FooterMobile: React.FC = () => {
  return (
    <Box component="footer" className="footer-mobile">
      <Container maxWidth="sm" className="footer-content">
        {/* Company Info */}
        <Box className="company-info">
          <Typography variant="h6" className="company-name">
            ta-Go
          </Typography>
          <Typography variant="body2" className="company-description">
            오토바이 거래의 새로운 기준
          </Typography>
        </Box>

        {/* Quick Links */}
        <Box className="quick-links">
          <Link href="/property" className="footer-link">
            매물
          </Link>
          <Link href="/agent" className="footer-link">
            중개사
          </Link>
          <Link href="/community" className="footer-link">
            커뮤니티
          </Link>
          <Link href="/cs" className="footer-link">
            고객센터
          </Link>
        </Box>

        {/* Social Links */}
        <Box className="social-links">
          <IconButton className="social-icon">
            <Facebook />
          </IconButton>
          <IconButton className="social-icon">
            <Twitter />
          </IconButton>
          <IconButton className="social-icon">
            <Instagram />
          </IconButton>
          <IconButton className="social-icon">
            <LinkedIn />
          </IconButton>
        </Box>

        {/* Bottom Bar */}
        <Box className="footer-bottom">
          <Typography variant="body2" className="copyright">
            © {new Date().getFullYear()} ta-Go. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default FooterMobile;
