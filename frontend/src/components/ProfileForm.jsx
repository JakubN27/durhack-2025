import { useState } from 'react';
import { supabase } from '../lib/supabase';

const ProfileForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: null,
    favoriteIceCream: '',
    spirit_animal: '',
    personality_type: 'introvert',
    daily_rhythm: 'early_bird',
    color: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      profilePicture: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user logged in');

      // If there's a profile picture, upload it first
      let profile_picture_url = null;
      if (formData.profilePicture) {
        const fileExt = formData.profilePicture.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `profile-pictures/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('profiles')
          .upload(filePath, formData.profilePicture);

        if (uploadError) throw uploadError;
        profile_picture_url = data.path;
      }

      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          updated_at: new Date().toISOString(),
          name: formData.name,
          profile_picture_url,
          favorite_ice_cream: formData.favoriteIceCream,
          spirit_animal: formData.spirit_animal,
          personality_type: formData.personality_type,
          daily_rhythm: formData.daily_rhythm,
          personal_color: formData.color
        });

      if (error) throw error;
      alert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Profile Picture */}
        <div>
          <label htmlFor="profilePicture" className="block text-gray-700 text-sm font-bold mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Favorite Ice Cream */}
        <div>
          <label htmlFor="favoriteIceCream" className="block text-gray-700 text-sm font-bold mb-2">
            Favorite Ice Cream
          </label>
          <input
            type="text"
            id="favoriteIceCream"
            name="favoriteIceCream"
            value={formData.favoriteIceCream}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Spirit Animal */}
        <div>
          <label htmlFor="spirit_animal" className="block text-gray-700 text-sm font-bold mb-2">
            What Animal Are You?
          </label>
          <input
            type="text"
            id="spirit_animal"
            name="spirit_animal"
            value={formData.spirit_animal}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Personality Type */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Are you an introvert or extrovert?
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="personality_type"
                value="introvert"
                checked={formData.personality_type === 'introvert'}
                onChange={handleInputChange}
                className="form-radio"
              />
              <span className="ml-2">Introvert</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="personality_type"
                value="extrovert"
                checked={formData.personality_type === 'extrovert'}
                onChange={handleInputChange}
                className="form-radio"
              />
              <span className="ml-2">Extrovert</span>
            </label>
          </div>
        </div>

        {/* Daily Rhythm */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Are you an early bird or a night owl?
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="daily_rhythm"
                value="early_bird"
                checked={formData.daily_rhythm === 'early_bird'}
                onChange={handleInputChange}
                className="form-radio"
              />
              <span className="ml-2">Early Bird</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="daily_rhythm"
                value="night_owl"
                checked={formData.daily_rhythm === 'night_owl'}
                onChange={handleInputChange}
                className="form-radio"
              />
              <span className="ml-2">Night Owl</span>
            </label>
          </div>
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="block text-gray-700 text-sm font-bold mb-2">
            If you were a color, what color would you be?
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;