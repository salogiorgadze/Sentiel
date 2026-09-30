import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VerifyEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        '/api/auth/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code: Number(code),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage(data.message);
      navigate('/login');
    } catch (error) {
      console.log(error);
      setMessage('Something went wrong');
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
              Check your inbox
            </p>
            <p className='mb-3 text-xs text-gray-500'>
              We sent a 6-digit code. It expires in 10 minutes.
            </p>
          </header>

          <form onSubmit={handleVerify} className='space-y-5'>
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
                Code
              </span>

              <input
                type='number'
                placeholder='Enter 6 digit code'
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete='new-password'
                className='h-13 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-[rgb(121,177,118)]/30'
                required
              />
            </label>

            <button
              type='submit'
              className='flex h-13.5 w-full items-center justify-center gap-3 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-[rgb(121,177,118)] hover:text-black focus:outline-none focus:ring-2 focus:ring-[rgb(121,177,118)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
            >
              Verify
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
            </button>
            {message && <p>{message}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}

export default VerifyEmail;
