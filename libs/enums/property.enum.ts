// 서버 사이드에서만 GraphQL 등록을 수행
let registerEnumType: any = null;

// 클라이언트 사이드에서는 registerEnumType을 사용하지 않음
if (typeof window === 'undefined') {
  try {
    const { registerEnumType: regEnumType } = require('@nestjs/graphql');
    registerEnumType = regEnumType;
  } catch (error) {
    // GraphQL 모듈이 없는 경우 무시
  }
}

export enum PropertyType {
	ADVENTURE_TOURERS = 'ADVENTURE_TOURERS',
	AGRICULTURE = 'AGRICULTURE',
	ALL_TERRAIN_VEHICLES = 'ALL_TERRAIN_VEHICLES',
	DIRT = 'DIRT',
	ELECTRIC = 'ELECTRIC',
	ENDURO = 'ENDURO',
	MINI_BIKES = 'MINI_BIKES',
	SXS_UTV = 'SXS_UTV',
}

if (registerEnumType) {
	registerEnumType(PropertyType, {
		name: 'PropertyType',
	});
}

export enum PropertyStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	RESERVED = 'RESERVED',
	DELETE = 'DELETE',
}

if (registerEnumType) {
	registerEnumType(PropertyStatus, {
		name: 'PropertyStatus',
	});
}

export enum PropertyLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGGI = 'GYEONGGI',
	GWANGJU = 'GWANGJU',
	JEONBUK = 'JEONBUK',
	DAEJEON = 'DAEJEON',
	JEJU = 'JEJU',
	ULSAN = 'ULSAN',
	GANGWON = 'GANGWON',
	CHUNGBUK = 'CHUNGBUK',
	CHUNGNAM = 'CHUNGNAM',
	JEONNAM = 'JEONNAM',
	GYEONGBUK = 'GYEONGBUK',
	GYEONGNAM = 'GYEONGNAM',
	
	MOTORCYCLE_SHOP = 'MOTORCYCLE_SHOP',
	DEALERSHIP = 'DEALERSHIP',
	PRIVATE_SELLER = 'PRIVATE_SELLER',
	ONLINE_MARKETPLACE = 'ONLINE_MARKETPLACE',
}

if (registerEnumType) {
	registerEnumType(PropertyLocation, {
		name: 'PropertyLocation',
	});
}

export enum FuelType {
	GASOLINE = 'GASOLINE',
	ELECTRIC = 'ELECTRIC',
	HYBRID = 'HYBRID',
}

if (registerEnumType) {
	registerEnumType(FuelType, {
		name: 'FuelType',
	});
}

export enum TransmissionType {
	MANUAL = 'MANUAL',
	AUTOMATIC = 'AUTOMATIC',
	CVT = 'CVT',
}

if (registerEnumType) {
	registerEnumType(TransmissionType, {
		name: 'TransmissionType',
	});
}

export enum ConditionType {
	EXCELLENT = 'EXCELLENT',
	GOOD = 'GOOD',
	FAIR = 'FAIR',
	POOR = 'POOR',
}

if (registerEnumType) {
	registerEnumType(ConditionType, {
		name: 'ConditionType',
	});
}
