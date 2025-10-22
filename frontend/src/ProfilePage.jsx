import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from './api';
import './App.css';

function ProfilePage() {
  const auth = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar yang diizinkan.');
      return;
    }

    setError('');
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file); 

    try {
      const response = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      auth.updateAvatar(response.data.avatarUrl); 
      alert('Avatar berhasil diupdate!');
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError('Gagal mengupdate avatar.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
         fileInputRef.current.value = null;
      }
    }
  };

  return (
    <div className="login-container" style={{ textAlign: 'center' }}>
      <h1>Profil: {auth.username}</h1>
      <img 
        src={`http://localhost:3001${auth.avatarUrl}`} 
        alt="Avatar" 
        className="profile-avatar"
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleAvatarChange}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg, image/gif"
      />
      <button 
        className="guestbook-form button"
        onClick={() => fileInputRef.current.click()}
        disabled={isUploading}
        style={{ marginTop: '20px', width: 'auto' }} 
      >
        {isUploading ? 'Mengupload...' : 'Ganti Avatar'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      <Link to="/App.jsx">Kembali ke Chat</Link>
    </div>
  );
}
export default ProfilePage;