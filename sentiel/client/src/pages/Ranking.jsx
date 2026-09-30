import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Ranking = () => {
  const navigate = useNavigate();

  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRanking = async () => {
      try {
        const response = await api.get('/api/student-projects/ranking');
        setRanking(response.data);
      } catch (err) {
        console.error(err);
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    getRanking();
  }, []);

  if (loading) {
    return <h1>Ranking loading...</h1>;
  }

  return (
    <main className='min-h-screen bg-[#f3f4ef] px-4 py-6 sm:px-6 sm:py-8 md:px-8'>
      <div className='mx-auto w-full max-w-5xl'>

        <div className='mb-6 sm:mb-8'>

          <button
            onClick={() => navigate('/admin')}
            className='mb-5 rounded-lg bg-black px-4 py-2 text-sm text-white sm:mb-6 sm:text-base'
          >
            ← Back
          </button>

          <p className='text-xs font-bold uppercase tracking-widest text-[#568253] sm:text-sm'>
            Student Ranking
          </p>

          <h1 className='mt-2 text-3xl font-bold sm:text-4xl'>
            Ranking
          </h1>

          <p className='mt-2 text-sm text-gray-500 sm:text-base'>
            Students ranked by their total XP.
          </p>
        </div>

        <div className='rounded-2xl bg-white p-4 shadow sm:p-6'>

          {ranking.length === 0 ? (
            <p className='text-sm text-gray-500 sm:text-base'>
              No students have projects yet.
            </p>
          ) : (
            <div className='space-y-3 sm:space-y-4'>

              {ranking.map((student, index) => {
                const position = index + 1;

                return (
                  <div
                    key={student._id}
                    className='flex items-center justify-between gap-3 rounded-xl border border-black/10 p-3 sm:gap-5 sm:p-5'
                  >
                    <div className='flex min-w-0 items-center gap-3 sm:gap-5'>

                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4ef] text-sm font-bold sm:h-10 sm:w-10 sm:text-base'>
                        {position}
                      </div>

                      <div className='min-w-0'>
                        <h2 className='truncate text-sm font-bold sm:text-base'>
                          {student.fullname}
                        </h2>

                        <p className='truncate text-xs text-gray-500 sm:text-sm'>
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className='shrink-0 text-right'>

                      <p className='text-xl font-bold sm:text-2xl'>
                        {student.xp}
                      </p>

                      <p className='text-xs text-gray-500 sm:text-sm'>
                        XP
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default Ranking;