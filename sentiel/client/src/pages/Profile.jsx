import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import achievements from '../data/achievements';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const userResponse = await api.get('/auth/me');

        const user = userResponse.data;

        setStudent(user);

        const projectsResponse = await api.get(
          `/student-projects/student/${user._id}`
        );

        setProjects(projectsResponse.data);
      } catch (err) {
        console.log('PROFILE ERROR:', err);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const formData = new FormData();

    formData.append('profilePicture', file);

    try {
      setUploading(true);

      const response = await api.patch(
        '/auth/profile-picture',
        formData
      );

      setStudent((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture,
      }));

      toast.success('Profile picture updated!');
    } catch (err) {
      console.log('UPLOAD ERROR:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to upload profile picture'
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#f3f4ef]'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#f3f4ef]'>
        <p className='text-gray-500'>
          Profile not found
        </p>
      </div>
    );
  }

  const totalXP = projects.reduce(
    (sum, project) => sum + project.score,
    0
  );

  const averageScore =
    projects.length === 0
      ? 0
      : totalXP / projects.length;

  return (
    <main className='min-h-screen bg-[#f3f4ef] px-6 py-8 md:px-10'>
      <div className='mx-auto max-w-6xl'>

        <button
          onClick={() => navigate(-1)}
          className='mb-8 rounded-xl bg-black px-4 py-2 text-white'
        >
          ← Back
        </button>

        <section className='rounded-3xl bg-white p-8 shadow-sm'>
          <div className='flex flex-col items-center gap-6 md:flex-row'>

            <div className='relative'>

              <div className='flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#f3f4ef] text-4xl font-bold text-[#568253]'>

                {student.profilePicture ? (
                  <img
                    src={`http://localhost:5001${student.profilePicture}`}
                    alt={student.fullname}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  student.fullname
                    ?.charAt(0)
                    .toUpperCase()
                )}

              </div>

              <label className='absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg'>

                +

                <input
                  type='file'
                  accept='image/*'
                  onChange={handlePictureUpload}
                  className='hidden'
                />

              </label>
            </div>

            <div className='text-center md:text-left'>

              <p className='text-sm font-bold uppercase tracking-widest text-[#568253]'>
                Student Profile
              </p>

              <h1 className='mt-2 text-4xl font-bold'>
                {student.fullname}
              </h1>

              <p className='mt-2 text-gray-500'>
                {student.email}
              </p>

              <p className='mt-2 text-sm capitalize text-gray-400'>
                {student.role}
              </p>

              {uploading && (
                <p className='mt-2 text-sm text-[#568253]'>
                  Uploading...
                </p>
              )}

            </div>
          </div>
        </section>

        <section className='mt-6 grid gap-4 md:grid-cols-3'>

          <div className='rounded-2xl bg-white p-6 shadow-sm'>
            <p className='text-sm text-gray-500'>
              Total XP
            </p>

            <p className='mt-2 text-3xl font-bold'>
              {totalXP}
            </p>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-sm'>
            <p className='text-sm text-gray-500'>
              Average Score
            </p>

            <p className='mt-2 text-3xl font-bold'>
              {averageScore.toFixed(1)}
            </p>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-sm'>
            <p className='text-sm text-gray-500'>
              Projects
            </p>

            <p className='mt-2 text-3xl font-bold'>
              {projects.length}
            </p>
          </div>

        </section>

        <section className='mt-8'>

          <p className='text-sm font-bold uppercase tracking-widest text-[#568253]'>
            Achievements
          </p>

          <h2 className='mt-2 text-2xl font-bold'>
            Your achievements
          </h2>

          <div className='mt-4 grid gap-4 md:grid-cols-3'>

            {(student.achievements || []).map(
              (achievementId) => {

                const achievement =
                  achievements[achievementId];

                if (!achievement) {
                  return null;
                }

                return (
                  <div
                    key={achievementId}
                    className='rounded-2xl bg-white p-5 shadow-sm'
                  >
                    <div className='flex items-center gap-4'>

                      <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f4ef]'>

                        {achievement.type === 'image' ? (
                          <img
                            src={achievement.icon}
                            alt={achievement.title}
                            className='h-8 w-8'
                          />
                        ) : (
                          <span className='text-2xl'>
                            {achievement.icon}
                          </span>
                        )}

                      </div>

                      <div>
                        <h3 className='font-bold'>
                          {achievement.title}
                        </h3>

                        <p className='text-sm text-gray-500'>
                          {achievement.description}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              }
            )}

          </div>

        </section>

        <section className='mt-8'>

          <p className='text-sm font-bold uppercase tracking-widest text-[#568253]'>
            Projects
          </p>

          <h2 className='mt-2 text-2xl font-bold'>
            Your projects
          </h2>

          <div className='mt-4 space-y-3'>

            {projects.length === 0 ? (
              <div className='rounded-2xl bg-white p-6'>
                <p className='text-gray-500'>
                  No projects yet.
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project._id}
                  className='flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm'
                >
                  <div>
                    <h3 className='font-bold'>
                      {project.title}
                    </h3>
                  </div>

                  <div className='text-right'>
                    <p className='text-2xl font-bold'>
                      {project.score}
                    </p>

                    <p className='text-sm text-gray-500'>
                      / 100
                    </p>
                  </div>
                </div>
              ))
            )}

          </div>

        </section>

      </div>
    </main>
  );
};

export default Profile;