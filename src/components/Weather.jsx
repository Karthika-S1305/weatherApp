import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Weather.css';
import moment from 'moment-timezone';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';
import humidity_icon from '../assets/humidity.png';

const Weather = () => {
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(null);
    const [locationDetails, setLocationDetails] = useState(null);
    const [currentTime, setCurrentTime] = useState('');
    const [locationCoords, setLocationCoords] = useState({ lat: 51.505, lng: -0.09 });

    const allIcons = {
        "o1d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": drizzle_icon,
        "04n": drizzle_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    };

    const fetchLocationDetails = async (lat, lon) => {
        try {
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.results.length > 0) {
                const result = data.results[0];
                const components = result.components;

                const details = {
                    country: components.country,
                    state: components.state || components.region,
                    district: components.county || components.state_district,
                    capital: components.state_capital || components.country_capital || 'Not Available'
                };

                setLocationDetails(details);
            } else {
                setLocationDetails(null);
            }
        } catch (error) {
            console.error("Error in fetching location details", error);
            setLocationDetails(null);
        }
    };

    const search = async (city) => {
        if (city === "") {
            alert("Enter city name");
            return;
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            const icon = allIcons[data.weather[0].icon] || clear_icon;
            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                timezone: data.timezone,
                icon: icon,
                coords: {
                    lat: data.coord.lat,
                    lng: data.coord.lon,
                }
            });

            setLocationCoords({ lat: data.coord.lat, lng: data.coord.lon });
            fetchLocationDetails(data.coord.lat, data.coord.lon);

            const localTime = moment.utc().add(data.timezone, 'seconds').format('YYYY-MM-DD HH:mm:ss');
            setCurrentTime(localTime);
        } catch (error) {
            setWeatherData(null);
            console.error("Error in fetching weather data", error);
        }
    };

    useEffect(() => {
        search("London");
    }, []);

    return (
        <div className="weather">
            <div className="search-bar">
                <input ref={inputRef} type="text" placeholder="Search" />
                <img src={search_icon} alt="" onClick={() => search(inputRef.current.value)} />
            </div>
            {weatherData && locationDetails && (
                <>
                    <div className="weather-flex">
                        <div className="weather-container">
                            <p className="current-time">Date and Time: {currentTime}</p>
                            <img src={weatherData.icon} alt="" className="weather-icon" />
                            <p className="temperature">{weatherData.temperature}°c</p>
                            <p className="location">{weatherData.location}</p>
                            <div className="weather-data">
                                <div className="col">
                                    <img src={humidity_icon} alt="" />
                                    <div>
                                        <p>{weatherData.humidity} %</p>
                                        <span>Humidity</span>
                                    </div>
                                </div>
                                <div className="col">
                                    <img src={wind_icon} alt="" />
                                    <div>
                                        <p>{weatherData.windSpeed} km/h</p>
                                        <span>Wind Speed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="leaflet-container">
                        <p className="location" style={{fontSize: '14px', color:'#7a0d63', fontWeight: '700', margin:'5px'}}>
                            District: {locationDetails.district?locationDetails.district:'NA'}, State: {locationDetails.state?locationDetails.state:'NA'}, Country: {locationDetails.country}
                            </p>
                            <MapContainer key={locationCoords.lat + locationCoords.lng} center={locationCoords} zoom={10} style={{ height: "300px", width: "100%" }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={locationCoords}>
                                    <Popup>
                                        {weatherData.location}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Weather;
