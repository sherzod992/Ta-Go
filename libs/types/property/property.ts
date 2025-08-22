import { PropertyLocation, PropertyStatus, PropertyType, FuelType, TransmissionType, PropertyCondition } from '../../enums/property.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Property {
	_id: string;
	propertyType: PropertyType;
	propertyStatus: PropertyStatus;
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
	propertyViews: number;
	propertyLikes: number;
	propertyComments: number;
	propertyRank: number;
	propertyImages: string[];
	propertyDesc?: string;
	propertyWarranty: boolean;
	propertyFinancing: boolean;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	manufacturedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Properties {
	list: Property[];
	metaCounter: TotalCounter[];
}
