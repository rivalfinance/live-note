import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { Box, Button, TextField, Typography, Paper, Alert, Link, CircularProgress, Divider } from '@mui/material';

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await register(formData.name, formData.email, formData.password);
      showSnackbar('Registration successful!');
      navigate('/notes');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bgcolor="#f9fafb">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" fontWeight={700} mb={1}>
          Create your account
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          Join us to start sharing your notes
        </Typography>
        {(error || authError) && (
          <Alert severity="error" sx={{ mb: 2 }}>{error || authError}</Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Full name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
            sx={{ py: 1.5, fontWeight: 600 }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Create account
          </Button>
        </Box>
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">Already have an account?</Typography>
        </Divider>
        <Link component={RouterLink} to="/login" underline="none" sx={{ display: 'block', textAlign: 'center', fontWeight: 500 }}>
          Sign in to your account
        </Link>
      </Paper>
    </Box>
  );
};

export default Register;