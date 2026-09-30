import React, { useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/auth/register', {
        fullname,
        email,
        password,
      });

      toast.success(response.data.message);
      navigate('/verify-email');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f4ef] px-4 py-10'>
      <div className='absolute -left-24 -top-24 h-64 w-64 rounded-full border-50 border-[rgb(121,177,118)]/20' />
      <div className='absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[rgb(121,177,118)]/15' />

      <section className='relative w-full max-w-lg overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.12)]'>
        <div className='h-2 bg-[rgb(121,177,118)]' />

        <div className='p-7 sm:p-10'>
          <header className='mb-8'>
            <div className='mb-8 flex items-center gap-3'>
              <span className='relative grid h-10 w-10 place-items-center rounded-full bg-[rgb(121,177,118)]'>
                <span className='h-4 w-4 rounded-full bg-black' />
                <span className='absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-black bg-[rgb(121,177,118)]' />
              </span>

              <span className='text-xl font-bold tracking-[-0.04em]'>
                sentinel.
              </span>
            </div>

            <p className='mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#568253]'>
              Get started
            </p>

            <h1 className='text-4xl font-semibold leading-tight tracking-tighter text-black'>
              Create your account
            </h1>
          </header>

          <form onSubmit={handleSubmit} className='space-y-5'>
            <label className='block'>
              <span className='mb-2 block text-[13px] font-semibold text-black'>
                Full name
              </span>

              <input
                type='text'
                placeholder='Enter your full name'
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                autoComplete='name'
                className='h-13 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-[rgb(121,177,118)]/30'
                required
              />
            </label>

            <label className='block'>
              <span className='mb-2 block text-[13px] font-semibold text-black'>
                Email address
              </span>

              <input
                type='email'
                placeholder='Enter your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete='email'
                className='h-13 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-[rgb(121,177,118)]/30'
                required
              />
            </label>

            <label className='block'>
              <span className='mb-2 block text-[13px] font-semibold text-black'>
                Password
              </span>

              <input
                type='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='new-password'
                className='h-13 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-[rgb(121,177,118)]/30'
                required
              />
            </label>

            {error && (
              <p
                role='alert'
                className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
              >
                {error}
              </p>
            )}

            <button
              type='submit'
              disabled={isSubmitting}
              className='flex h-13.5 w-full items-center justify-center gap-3 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-[rgb(121,177,118)] hover:text-black focus:outline-none focus:ring-2 focus:ring-[rgb(121,177,118)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
              {!isSubmitting && (
                <svg
                  aria-hidden='true'
                  viewBox='0 0 20 20'
                  className='h-5 w-5 fill-none stroke-current'
                >
                  <path
                    d='M4 10h12m-5-5 5 5-5 5'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </button>
            <button
          type='button'
          onClick={() => {
            window.location.href = '/api/auth/google';;
          }}
          className='w-full bg-white text-gray-800 font-bold p-3 rounded mt-4'
        >
          Continue with Google
        </button> 
          </form>
          <p className='mt-7 text-center text-sm text-black/55'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-semibold text-black underline decoration-[rgb(121,177,118)] decoration-2 underline-offset-4'
            >
              Login here
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;


