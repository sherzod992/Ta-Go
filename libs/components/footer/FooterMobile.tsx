import React from 'react';
import { Box, Container, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';

const FooterMobile: React.FC = () => {
  return (
    <Box component="footer" className="footer-mobile" sx={{
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #e0e0e0',
      padding: '24px 0 16px 0',
      marginTop: 'auto'
    }}>
      <Container maxWidth="sm" sx={{ padding: '0 16px' }}>
        {/* 회사 정보 */}
        <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            color: '#667eea',
            marginBottom: 1
          }}>
            ta-Go
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#666',
            lineHeight: 1.5,
            marginBottom: 2
          }}>
            오토바이 거래의 새로운 기준
          </Typography>
        </Box>

        {/* 빠른 링크 */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 2, 
          marginBottom: 3 
        }}>
          <Box>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 'bold', 
              marginBottom: 1,
              color: '#333'
            }}>
              서비스
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link href="/property" sx={{ 
                color: '#666', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                '&:hover': { color: '#667eea' }
              }}>
                매물
              </Link>
              <Link href="/agent" sx={{ 
                color: '#666', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                '&:hover': { color: '#667eea' }
              }}>
                중개사
              </Link>
              <Link href="/community" sx={{ 
                color: '#666', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                '&:hover': { color: '#667eea' }
              }}>
                커뮤니티
              </Link>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 'bold', 
              marginBottom: 1,
              color: '#333'
            }}>
              고객지원
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link href="/cs" sx={{ 
                color: '#666', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                '&:hover': { color: '#667eea' }
              }}>
                고객센터
              </Link>
              <Link href="/faq" sx={{ 
                color: '#666', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                '&:hover': { color: '#667eea' }
              }}>
                자주묻는질문
              </Link>
              <Link href="/terms" sx={{ 
                color: '#666', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                '&:hover': { color: '#667eea' }
              }}>
                이용약관
              </Link>
            </Box>
          </Box>
        </Box>

        {/* 연락처 정보 */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 'bold', 
            marginBottom: 1,
            color: '#333',
            textAlign: 'center'
          }}>
            연락처
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 0.5,
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email sx={{ fontSize: 16, color: '#666' }} />
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                info@ta-go.com
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ fontSize: 16, color: '#666' }} />
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                +82 2-1234-5678
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: 16, color: '#666' }} />
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                서울, 대한민국
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        {/* 소셜 미디어 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 1, 
          marginBottom: 2 
        }}>
          <IconButton sx={{ 
            color: '#666',
            '&:hover': { color: '#667eea' }
          }}>
            <Facebook />
          </IconButton>
          <IconButton sx={{ 
            color: '#666',
            '&:hover': { color: '#667eea' }
          }}>
            <Twitter />
          </IconButton>
          <IconButton sx={{ 
            color: '#666',
            '&:hover': { color: '#667eea' }
          }}>
            <Instagram />
          </IconButton>
          <IconButton sx={{ 
            color: '#666',
            '&:hover': { color: '#667eea' }
          }}>
            <LinkedIn />
          </IconButton>
        </Box>

        {/* 저작권 */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ 
            color: '#999',
            fontSize: '0.8rem'
          }}>
            © {new Date().getFullYear()} ta-Go. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default FooterMobile;
