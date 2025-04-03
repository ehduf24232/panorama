import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import axios from 'axios';
=======
import api from '../api';
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b

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

<<<<<<< HEAD
// axios 기본 설정
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.timeout = 5000;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 요청 인터셉터 추가
axios.interceptors.request.use(
  (config) => {
    console.log('API 요청:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
axios.interceptors.response.use(
  (response) => {
    console.log('API 응답:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API 응답 오류:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

=======
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
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
<<<<<<< HEAD
        const neighborhoodsRes = await axios.get('/api/neighborhoods');
=======
        const neighborhoodsRes = await api.get('/api/neighborhoods');
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
        console.log('동네 데이터 응답:', neighborhoodsRes.data);
        setNeighborhoods(neighborhoodsRes.data);
      } catch (error) {
        console.error('동네 데이터 로딩 실패:', error);
      }

      try {
<<<<<<< HEAD
        const buildingsRes = await axios.get('/api/buildings');
=======
        const buildingsRes = await api.get('/api/buildings');
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
        console.log('건물 데이터 응답:', buildingsRes.data);
        setBuildings(buildingsRes.data);
      } catch (error) {
        console.error('건물 데이터 로딩 실패:', error);
      }

      try {
<<<<<<< HEAD
        const roomsRes = await axios.get('/api/rooms');
=======
        const roomsRes = await api.get('/api/rooms');
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
        console.log('호실 데이터 응답:', roomsRes.data);
        setRooms(roomsRes.data);
      } catch (error) {
        console.error('호실 데이터 로딩 실패:', error);
      }

    } catch (error) {
      console.error('전체 데이터 로딩 중 오류 발생:', error);
<<<<<<< HEAD
      if (axios.isAxiosError(error)) {
        console.error('응답 데이터:', error.response?.data);
      }
=======
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
    }
  };

  const fetchBuildingsByNeighborhood = useCallback(async (neighborhoodId: string) => {
    try {
      console.log('[건물 데이터 요청]', { neighborhoodId });
<<<<<<< HEAD
      const response = await axios.get(`/api/buildings/neighborhood/${neighborhoodId}`);
=======
      const response = await api.get(`/api/buildings/neighborhood/${neighborhoodId}`);
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
      console.log('[건물 데이터 응답]', response.data);
      setBuildings(response.data);

      // 해당 건물들의 호실 정보도 함께 가져옴
      const buildingIds = response.data.map((building: Building) => building._id);
<<<<<<< HEAD
      const roomsResponse = await axios.get(`/api/rooms/buildings/${buildingIds.join(',')}`);
=======
      const roomsResponse = await api.get(`/api/rooms/buildings/${buildingIds.join(',')}`);
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
      console.log('[호실 데이터 응답]', roomsResponse.data);
      setRooms(roomsResponse.data);
    } catch (error) {
      console.error('건물 데이터 로딩 중 오류 발생:', error);
    }
  }, []);

  const addNeighborhood = async (formData: FormData) => {
    try {
<<<<<<< HEAD
      const response = await axios.post('/api/neighborhoods', formData, {
=======
      const response = await api.post('/api/neighborhoods', formData, {
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
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
<<<<<<< HEAD
      await axios.delete(`/api/neighborhoods/${id}`);
=======
      await api.delete(`/api/neighborhoods/${id}`);
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
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
<<<<<<< HEAD
      const response = await axios.post('/api/buildings', formData, {
=======
      const response = await api.post('/api/buildings', formData, {
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
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
<<<<<<< HEAD
      await axios.delete(`/api/buildings/${id}`);
=======
      await api.delete(`/api/buildings/${id}`);
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
      setBuildings(buildings.filter(b => b._id !== id));
      setRooms(rooms.filter(r => r.buildingId !== id));
    } catch (error) {
      console.error('건물 삭제 중 오류 발생:', error);
      throw error;
    }
  };

  const addRoom = async (formData: FormData) => {
    try {
<<<<<<< HEAD
      const response = await axios.post('/api/rooms', formData, {
=======
      const response = await api.post('/api/rooms', formData, {
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
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
<<<<<<< HEAD
      await axios.delete(`/api/rooms/${id}`);
=======
      await api.delete(`/api/rooms/${id}`);
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
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