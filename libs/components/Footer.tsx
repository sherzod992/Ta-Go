import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              ta-Go
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Your trusted partner for finding the perfect motorcycle. 
              We connect riders with their dream bikes through our comprehensive platform.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/property" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Properties
              </Link>
              <Link href="/agent" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Agents
              </Link>
              <Link href="/community" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Community
              </Link>
              <Link href="/cs" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Customer Service
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Help Center
              </Link>
              <Link href="/contact" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Contact Us
              </Link>
              <Link href="/faq" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                FAQ
              </Link>
              <Link href="/terms" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Terms of Service
              </Link>
            </Box>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/privacy" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Terms of Use
              </Link>
              <Link href="/cookies" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Cookie Policy
              </Link>
              <Link href="/disclaimer" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Disclaimer
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Email: info@ta-go.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Phone: +82 2-1234-5678
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Address: Seoul, South Korea
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            mt: 4,
            pt: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} ta-Go. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
