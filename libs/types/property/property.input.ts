import { PropertyLocation, PropertyStatus, PropertyType, FuelType, TransmissionType, PropertyCondition } from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

export interface PropertyInput {
	propertyType: PropertyType;
	propertyLocation: PropertyLocation;
	propertyAddress: string;
	propertyTitle: string;
	propertyPrice: number;
	propertyBrand: string;
	propertyModel: string;
	propertyYear: number;
	propertyMileage: number;
	propertyEngineSize: number;
	propertyFuelType: FuelType;
	propertyTransmission: TransmissionType;
	propertyColor: string;
	propertyCondition: PropertyCondition;
	propertyImages: string[];
	propertyDesc?: string;
	manufacturedAt?: Date;
}

interface PISearch {
	memberId?: string;
	locationList?: PropertyLocation[];
	typeList?: PropertyType[];
	brandList?: string[];
	options?: string[];
	yearRange?: Range;
	pricesRange?: Range;
	mileageRange?: Range;
	engineSizeRange?: Range;
	text?: string;
}

export interface PropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	propertyStatus?: PropertyStatus;
}

export interface AgentPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}

interface ALPISearch {
	propertyStatus?: PropertyStatus;
	propertyLocationList?: PropertyLocation[];
}

export interface AllPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
