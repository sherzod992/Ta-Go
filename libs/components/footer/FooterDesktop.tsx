import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const FooterDesktop: React.FC = () => {
  return (
    <Box component="footer" className="footer-pc">
      <Container maxWidth="lg" className="footer-content">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box className="company-info">
              <Typography variant="h6" className="company-name">
                ta-Go
              </Typography>
              <Typography variant="body2" className="company-description">
                Your trusted partner for finding the perfect motorcycle. 
                We connect riders with their dream bikes through our comprehensive platform.
              </Typography>
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
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Box className="footer-section">
              <Typography variant="h6" className="section-title">
                Quick Links
              </Typography>
              <Box className="section-links">
                <Link href="/property" className="footer-link">
                  Properties
                </Link>
                <Link href="/agent" className="footer-link">
                  Agents
                </Link>
                <Link href="/community" className="footer-link">
                  Community
                </Link>
                <Link href="/cs" className="footer-link">
                  Customer Service
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={2}>
            <Box className="footer-section">
              <Typography variant="h6" className="section-title">
                Support
              </Typography>
              <Box className="section-links">
                <Link href="/help" className="footer-link">
                  Help Center
                </Link>
                <Link href="/contact" className="footer-link">
                  Contact Us
                </Link>
                <Link href="/faq" className="footer-link">
                  FAQ
                </Link>
                <Link href="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} sm={6} md={2}>
            <Box className="footer-section">
              <Typography variant="h6" className="section-title">
                Legal
              </Typography>
              <Box className="section-links">
                <Link href="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="footer-link">
                  Terms of Use
                </Link>
                <Link href="/cookies" className="footer-link">
                  Cookie Policy
                </Link>
                <Link href="/disclaimer" className="footer-link">
                  Disclaimer
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={2}>
            <Box className="footer-section">
              <Typography variant="h6" className="section-title">
                Contact
              </Typography>
              <Box className="contact-info">
                <Typography variant="body2" className="contact-item">
                  Email: info@ta-go.com
                </Typography>
                <Typography variant="body2" className="contact-item">
                  Phone: +82 2-1234-5678
                </Typography>
                <Typography variant="body2" className="contact-item">
                  Address: Seoul, South Korea
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

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

export default FooterDesktop;
