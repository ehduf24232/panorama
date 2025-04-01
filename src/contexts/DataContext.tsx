import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

// 타입 정의
export interface Neighborhood {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Building {
  _id: string;
  name: string;
  neighborhoodId: string;
  address: string;
  floors: number;
  description: string;
  imageUrl: string;
}

export interface Room {
  _id: string;
  name: string;
  buildingId: string;
  number: string;
  floor: number;
  size: number;
  price: number;
  description: string;
  imageUrl: string;
  panoramas: {
    url: string;
    tag: string;
  }[];
}

interface DataContextType {
  neighborhoods: Neighborhood[];
  buildings: Building[];
  rooms: Room[];
  addNeighborhood: (formData: FormData) => Promise<void>;
  deleteNeighborhood: (id: string) => Promise<void>;
  addBuilding: (formData: FormData) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  addRoom: (formData: FormData) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  fetchBuildingsByNeighborhood: (neighborhoodId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('데이터 로딩 시작');

      // 각 API 호출을 개별적으로 처리
      try {
        const neighborhoodsRes = await api.get('/api/neighborhoods');
        console.log('동네 데이터 응답:', neighborhoodsRes.data);
        setNeighborhoods(neighborhoodsRes.data);
      } catch (error) {
        console.error('동네 데이터 로딩 실패:', error);
      }

      try {
        const buildingsRes = await api.get('/api/buildings');
        console.log('건물 데이터 응답:', buildingsRes.data);
        setBuildings(buildingsRes.data);
      } catch (error) {
        console.error('건물 데이터 로딩 실패:', error);
      }

      try {
        const roomsRes = await api.get('/api/rooms');
        console.log('호실 데이터 응답:', roomsRes.data);
        setRooms(roomsRes.data);
      } catch (error) {
        console.error('호실 데이터 로딩 실패:', error);
      }

    } catch (error) {
      console.error('전체 데이터 로딩 중 오류 발생:', error);
    }
  };

  const fetchBuildingsByNeighborhood = useCallback(async (neighborhoodId: string) => {
    try {
      console.log('[건물 데이터 요청]', { neighborhoodId });
      const response = await api.get(`/api/buildings/neighborhood/${neighborhoodId}`);
      console.log('[건물 데이터 응답]', response.data);
      setBuildings(response.data);

      // 해당 건물들의 호실 정보도 함께 가져옴
      const buildingIds = response.data.map((building: Building) => building._id);
      const roomsResponse = await api.get(`/api/rooms/buildings/${buildingIds.join(',')}`);
      console.log('[호실 데이터 응답]', roomsResponse.data);
      setRooms(roomsResponse.data);
    } catch (error) {
      console.error('건물 데이터 로딩 중 오류 발생:', error);
    }
  }, []);

  const addNeighborhood = async (formData: FormData) => {
    try {
      const response = await api.post('/api/neighborhoods', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNeighborhoods([...neighborhoods, response.data]);
    } catch (error) {
      console.error('동네 추가 중 오류 발생:', error);
      throw error;
    }
  };

  const deleteNeighborhood = async (id: string) => {
    try {
      await api.delete(`/api/neighborhoods/${id}`);
      setNeighborhoods(neighborhoods.filter(n => n._id !== id));
      setBuildings(buildings.filter(b => b.neighborhoodId !== id));
      setRooms(rooms.filter(r => {
        const building = buildings.find(b => b._id === r.buildingId);
        return building && building.neighborhoodId !== id;
      }));
    } catch (error) {
      console.error('동네 삭제 중 오류 발생:', error);
      throw error;
    }
  };

  const addBuilding = async (formData: FormData) => {
    try {
      const response = await api.post('/api/buildings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setBuildings([...buildings, response.data]);
    } catch (error) {
      console.error('건물 추가 중 오류 발생:', error);
      throw error;
    }
  };

  const deleteBuilding = async (id: string) => {
    try {
      await api.delete(`/api/buildings/${id}`);
      setBuildings(buildings.filter(b => b._id !== id));
      setRooms(rooms.filter(r => r.buildingId !== id));
    } catch (error) {
      console.error('건물 삭제 중 오류 발생:', error);
      throw error;
    }
  };

  const addRoom = async (formData: FormData) => {
    try {
      const response = await api.post('/api/rooms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setRooms([...rooms, response.data]);
    } catch (error) {
      console.error('호실 추가 중 오류 발생:', error);
      throw error;
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await api.delete(`/api/rooms/${id}`);
      setRooms(rooms.filter(r => r._id !== id));
    } catch (error) {
      console.error('호실 삭제 중 오류 발생:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        neighborhoods,
        buildings,
        rooms,
        addNeighborhood,
        deleteNeighborhood,
        addBuilding,
        deleteBuilding,
        addRoom,
        deleteRoom,
        fetchBuildingsByNeighborhood
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 