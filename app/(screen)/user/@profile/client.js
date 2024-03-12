// // 'use client';
// import { useState, useEffect, useCallback } from 'react';
// import { createClient } from '@/app/(screen)/_utils/supabase/client';
// import { cookies } from 'next/headers'

// const ClientProfileComponent = ({ session }) => {
//   const [fullname, setFullname] = useState(null);
//   const [avatarUrl, setAvatarUrl] = useState(null);
//   const user = session.user;
//   const cookieStore = cookies()
//   const supabase = createClient(cookieStore);

//   const getProfile = useCallback(async () => {
//     try {
//       const { data, error, status } = await supabase
//         .from('profiles')
//         .select('full_name, avatar_url')
//         .eq('id', user?.id)
//         .single();

//       if (error && status !== 406) {
//         throw error;
//       }

//       if (data) {
//         setFullname(data.full_name);
//         setAvatarUrl(data.avatar_url);
//       }
//     } catch (error) {
//       console.error(error);
//       alert('Error loading user data!');
//     }
//   }, [supabase, user?.id]);

//   useEffect(() => {
//     getProfile();
//   }, [getProfile]);

//   const updateProfile = async ({ avatar_url }) => {
//     try {
//       const { error } = await supabase.from('profiles').upsert({
//         id: user?.id,
//         full_name: fullname,
//         avatar_url,
//         updated_at: new Date().toISOString(),
//       });
//       if (error) {
//         throw error;
//       }
//       alert('Profile updated!');
//     } catch (error) {
//       alert('Error updating the data!');
//       console.error(error);
//     }
//   };

//   return (
//     <section>
//       <h2 className='text-2xl font-bold'>ユーザー情報</h2>
//       <form
//         className='animate-in flex flex-col justify-center gap-2 text-foreground'
//       >
//         <div className='mt-4 flex flex-col justify-center gap-2 text-foreground'>
//           <label className='text-md' htmlFor='email'>Email</label>
//           <input
//             className='rounded-md px-4 py-2 bg-inherit border mb-6'
//             id='email'
//             type='text'
//             defaultValue={session.user.email}
//             disabled
//             />
//         </div>
//         <div className='flex flex-col justify-center gap-2 text-foreground'>
//           <label className='text-md' htmlFor='fullName'>Full Name</label>
//           <input
//             className='rounded-md px-4 py-2 bg-inherit border mb-6'
//             id='fullName'
//             type='text'
//             value={fullname || ''}
//             onChange={e => setFullname(e.target.value)}
//           />
//         </div>

//         <div>
//           <button
//             type='button'
//             className='bg-green-700 hover:bg-green-600 text-green-100 rounded-md px-4 py-2 text-foreground mb-2 transition-all'
//             onClick={() => updateProfile({ fullname, avatarUrl })}
//           >
//             Update
//           </button>
//         </div>
//       </form>
//     </section>
//   );
// };

// export default ClientProfileComponent;
