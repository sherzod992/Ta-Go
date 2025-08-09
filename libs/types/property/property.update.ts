import { PropertyLocation, PropertyStatus, PropertyType, FuelType, TransmissionType, ConditionType } from '../../enums/property.enum';

export interface PropertyUpdate {
	_id: string;
	propertyType?: PropertyType;
	propertyStatus?: PropertyStatus;
	propertyLocation?: PropertyLocation;
	propertyAddress?: string;
	propertyTitle?: string;
	propertyPrice?: number;
	propertyBrand?: string;
	propertyModel?: string;
	propertyYear?: number;
	propertyMileage?: number;
	propertyEngineSize?: number;
	propertyFuelType?: FuelType;
	propertyTransmission?: TransmissionType;
	propertyColor?: string;
	propertyCondition?: ConditionType;
	propertyImages?: string[];
	propertyDesc?: string;
	propertyWarranty?: boolean;
	propertyFinancing?: boolean;
	soldAt?: Date;
	deletedAt?: Date;
	manufacturedAt?: Date;
}
