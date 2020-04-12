import axios from "axios";

const baseURL = 'https://israel-sky.s3-eu-west-1.amazonaws.com/';

const instance = axios.create({
  baseURL,
});

export const getWeatherParams = () => instance.get('/weather-params.json')
export const getWeatherFeatures = (day, time = 19, param) => instance.get(`${day}/${time}/${param}.json`)

export const getPhotoSpotsParams = () => instance.get('/photo-params.json')
export const getPhotoSpotsFeatures = (day, param) => instance.get(`${day}/${param}.json`)
