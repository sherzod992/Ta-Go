export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

export const availableOptions = ['propertyWarranty', 'propertyFinancing'];

const thisYear = new Date().getFullYear();

export const motorcycleYears: any = [];

for (let i = 1970; i <= thisYear; i++) {
	motorcycleYears.push(String(i));
}

export const motorcycleBrands = [
	'HONDA', 'YAMAHA', 'SUZUKI', 'KAWASAKI', 'BMW', 'DUCATI', 'KTM', 
	'HARLEY_DAVIDSON', 'TRIUMPH', 'APRILIA', 'MV_AGUSTA', 'HUSQVARNA',
	'INDIAN', 'VICTORY', 'ROYAL_ENFIELD', 'BENELLI', 'MOTO_GUZZI'
];

export const engineSizes = [50, 125, 250, 400, 500, 600, 750, 1000, 1200, 1300, 1400, 1600, 1800, 2000];

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topPropertyRank = 2;