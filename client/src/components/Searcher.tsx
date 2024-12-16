import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./Activities";
import { Activity } from "../activityData";
import searchActivities from "./searchLogic";

import Bear4 from '../assets/Bear4.png';

// confused about whether to move this elsewhere? 
const styles = `
  .limelight { font-family: 'Limelight', cursive; }
  .paytone { font-family: 'Paytone One', sans-serif; }
  .kadwa { font-family: 'Kadwa', serif; }
  .text-custom { font-size: 20px; }
  .text-submit { font-size: 32px; }
  .text-logout { font-size: 20px; }
  
  .toggle-label {
      width: 60px;
      height: 30px;
      position: relative;
      background: #e5e5e5;
      border-radius: 15px;
      cursor: pointer;
  }
  
  .toggle-label:after {
      content: '';
      width: 28px;
      height: 28px;
      position: absolute;
      left: 1px;
      top: 1px;
      background: #DC2626;
      border-radius: 50%;
      transition: 0.3s;
  }
  
  .toggle-input:checked + .toggle-label {
      background: #DC2626;
  }
  
  .toggle-input:checked + .toggle-label:after {
      left: 31px;
      background: white;
  }
`;

export default function Searcher() {
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState([]);

    const [formData, setFormData] = useState({
        keyword: '',
        eventCategory: '',
        time: '',
        location: '',
        isOnCampus: false,
        date: ''
    });

    // Handle form changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        
        const filters = {
            isOnCampus: formData.isOnCampus,
            startDate: formData.date,
            endDate: null,
            category: formData.eventCategory,
        };

        try {
            const results = await searchActivities(formData.keyword, filters);
            navigate("/", { state: { searchResults: results } });
            console.log("Search Results:", results);
          } catch (error) {
            console.error("Error during search:", error);
          }
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#5C4033] p-8">
            {/* Inject CSS */}
            <style>{styles}</style>


            {/* Back Button... needs work? */}
            <button 
                onClick={handleBack}
                className="bg-red-700 text-white px-4 py-2 rounded-sm flex items-center mb-8 paytone"
            >
                <div className="back-arrow">
                </div>
                <svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="white"><path d="M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                <span>Back to main</span>
            </button>

            <div className="bg-[#E5DDD5] rounded-3xl p-12 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    {/* Keyword + categorization */}
                    <div className="flex gap-8 mb-8">
                        <div className="flex-1">
                            <label className="block text-red-700 mb-2 kadwa text-custom">Keyword</label>
                            <input
                                type="text"
                                name="keyword"
                                value={formData.keyword}
                                onChange={handleChange}
                                className="w-full p-3 rounded border border-gray-300"
                                placeholder="Enter keyword"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-red-700 mb-2 kadwa text-custom">Event Category</label>
                            <select 
                                name="eventCategory"
                                value={formData.eventCategory}
                                onChange={handleChange}
                                className="w-full p-3 rounded border border-gray-300 bg-white appearance-none"
                            >
                                <option value="">Select Category</option>
                                <option value="food-and-drink">Food</option>
                                <option value="Workshop">Workshop</option>
                                <option value="music">Music</option>
                                <option value="Show">Show</option>
                                <option value="Brown event">Brown event</option>
                                <option value="holiday">Holiday</option>
                                <option value="fashion">Fashion</option>
                                <option value="arts">Arts</option>
                                <option value="community">Community</option>
                                <option value="spirituality">Spirituality</option>
                                <option value="home-and-lifestyle">Home & Lifestyle</option>
                            </select>
                        </div>
                    </div>

                    {/* Time, Location, and On-Campus */}
                    <div className="flex gap-8 mb-8 items-start">
                        <div className="w-1/4">
                            <label className="block text-red-700 mb-2 kadwa text-custom">Time</label>
                            <select
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full p-3 rounded border border-gray-300 bg-white appearance-none"
                            >
                                <option value="">Select Time</option>
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-red-700 mb-2 kadwa text-custom">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full p-3 rounded border border-gray-300"
                                placeholder="Enter location"
                            />
                        </div>
                        <div className="flex items-center pt-8 gap-3">
                            <span className="text-red-700 kadwa text-custom">On-Campus</span>
                            <div className="relative">
                                <input 
                                    type="checkbox"
                                    name="isOnCampus"
                                    checked={formData.isOnCampus}
                                    onChange={handleChange}
                                    className="toggle-input opacity-0 absolute h-0 w-0"
                                    id="onCampusToggle"
                                />
                                <label htmlFor="onCampusToggle" className="toggle-label block"></label>
                            </div>
                        </div>
                    </div>

                    {/*Date */}
                    <div className="mb-12">
                        <label className="block text-red-700 mb-2 kadwa text-custom">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full md:w-1/3 p-3 rounded border border-gray-300"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button 
                            type="submit"
                            className="bg-red-700 text-white px-12 py-4 rounded-lg paytone text-submit hover:bg-red-800 transition uppercase"
                            // formMethod= "get"
                            // formAction= "/activities"
                        >
                            Submit Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
/* 
        </form>
      <div className="flex flex-row">
        <input
          // value={searchInput || ""}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Enter area search term"
          aria-description="Enter the keyword you would like to search the area descriptions for"
          type="text"
          placeholder="Search Keyword"
        ></input>
        <div>
        <input
          type="checkbox"
          id="onCampusCheckbox"
          onChange={(e) => setIsOnCampusState(e.target.checked ? true : null)}
        />
        <label htmlFor="onCampusCheckbox" className="ml-2">
          On Campus
        </label>
      </div>
        <input
          type="date"
          onChange={(e) => setStartDateState(e.target.value || null)}
        />
        <input
          type="date"
          onChange={(e) => setEndDateState(e.target.value || null)}
        />
        <select onChange={(e) => setCategoryState(e.target.value || null)}>
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Workshop">Workshop</option>
        </select>
        <button
          onClick={() => {
            console.log("Keyword:", searchInput);

            const filters = {
              isOnCampus: isOnCampusState || null, 
              startDate: startDateState || null,   
              endDate: endDateState || null,      
              category: categoryState || null,
            };
            
            searchActivities(searchInput || "", filters);
          }}
        > */