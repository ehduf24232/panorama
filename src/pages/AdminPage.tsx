import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import HomeButton from '../components/HomeButton';

// axios 인스턴스 생성
const API_BASE_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL
});

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const Section = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #0066cc;
`;

const Form = styled.form`
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

const Button = styled.button`
  background-color: #0066cc;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 1rem;

  &:hover {
    background-color: #0052a3;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;

  &:hover {
    background-color: #c82333;
  }
`;

const EditButton = styled(Button)`
  background-color: #28a745;

  &:hover {
    background-color: #218838;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
  background-color: #f8f9fa;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
`;

const Message = styled.div<{ isError?: boolean }>`
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  color: ${props => props.isError ? '#dc3545' : '#28a745'};
  background-color: ${props => props.isError ? '#f8d7da' : '#d4edda'};
`;

const DownloadButton = styled(Button)`
  background-color: #28a745;
  margin-bottom: 2rem;

  &:hover {
    background-color: #218838;
  }
`;

const AdminPage: React.FC = () => {
  // 사이트 설정 상태
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [customLinkText, setCustomLinkText] = useState('');
  
  // 동네 관리 상태
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const [neighborhoodDescription, setNeighborhoodDescription] = useState('');
  const [neighborhoodImage, setNeighborhoodImage] = useState<File | null>(null);
  
  // 건물 관리 상태
  const [buildings, setBuildings] = useState<any[]>([]);
  const [buildingName, setBuildingName] = useState('');
  const [buildingAddress, setBuildingAddress] = useState('');
  const [buildingDescription, setBuildingDescription] = useState('');
  const [buildingFloors, setBuildingFloors] = useState<number>(1);
  const [buildingImage, setBuildingImage] = useState<File | null>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('');
  
  // 호실 관리 상태
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomName, setRoomName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomSize, setRoomSize] = useState('');
  const [roomPrice, setRoomPrice] = useState<number>(0);
  const [roomFloor, setRoomFloor] = useState<number>(1);
  const [roomDescription, setRoomDescription] = useState('');
  const [roomImage, setRoomImage] = useState<File | null>(null);
  const [roomPanoramas, setRoomPanoramas] = useState<File[]>([]);
  const [panoramaTags, setPanoramaTags] = useState<string[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [roomArea, setRoomArea] = useState<number>(0);

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 수정 모드 상태
  const [editingNeighborhoodId, setEditingNeighborhoodId] = useState<string | null>(null);
  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    if (selectedNeighborhoodId) {
      fetchBuildings(selectedNeighborhoodId);
    } else {
      setBuildings([]);
    }
  }, [selectedNeighborhoodId]);

  useEffect(() => {
    if (selectedBuildingId) {
      fetchRooms(selectedBuildingId);
    } else {
      setRooms([]);
    }
  }, [selectedBuildingId]);

  // 설정 관련 함수들
  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      const settings = response.data;
      if (settings) {
        setCustomLinkUrl(settings.customLinkUrl || '');
        setCustomLinkText(settings.customLinkText || '');
      }
    } catch (error) {
      console.error('설정을 불러오는데 실패했습니다:', error);
      setMessage('설정을 불러오는데 실패했습니다.');
      setIsError(true);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        customLinkUrl,
        customLinkText
      });
      setMessage('설정이 성공적으로 저장되었습니다.');
      setIsError(false);
    } catch (error) {
      console.error('설정 저장 중 오류 발생:', error);
      setMessage('설정 저장에 실패했습니다.');
      setIsError(true);
    }
  };

  // 동네 관련 함수들
  const fetchNeighborhoods = async () => {
    try {
      const response = await api.get('/neighborhoods');
      setNeighborhoods(response.data);
    } catch (error) {
      console.error('동네 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const handleNeighborhoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', neighborhoodName);
      formData.append('description', neighborhoodDescription);
      if (neighborhoodImage) {
        formData.append('image', neighborhoodImage);
      }

      let response;
      if (editingNeighborhoodId) {
        response = await api.put(`/neighborhoods/${editingNeighborhoodId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('동네가 성공적으로 수정되었습니다.');
      } else {
        response = await api.post('/neighborhoods', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('동네가 성공적으로 추가되었습니다.');
      }

      // 폼 초기화
      setNeighborhoodName('');
      setNeighborhoodDescription('');
      setNeighborhoodImage(null);
      setEditingNeighborhoodId(null);

      // 동네 목록 새로고침
      fetchNeighborhoods();
    } catch (error) {
      console.error('동네 저장 에러:', error);
      setMessage('동네 저장에 실패했습니다.');
    }
  };

  const handleNeighborhoodDelete = async (id: string) => {
    try {
      await api.delete(`/neighborhoods/${id}`);
      setMessage('동네가 성공적으로 삭제되었습니다.');
      setIsError(false);
      fetchNeighborhoods();
    } catch (error) {
      console.error('동네 삭제 중 오류 발생:', error);
      setMessage('동네 삭제에 실패했습니다.');
      setIsError(true);
    }
  };

  // 건물 관련 함수들
  const fetchBuildings = async (neighborhoodId: string) => {
    try {
      console.log('건물 목록 요청:', neighborhoodId);
      const response = await api.get(`/buildings/neighborhood/${neighborhoodId}`);
      console.log('건물 목록 응답:', response.data);
      setBuildings(response.data);
    } catch (error) {
      console.error('건물 목록을 불러오는데 실패했습니다:', error);
      setBuildings([]);
    }
  };

  const handleBuildingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', buildingName);
      formData.append('address', buildingAddress);
      formData.append('description', buildingDescription);
      formData.append('floors', buildingFloors.toString());
      formData.append('neighborhoodId', selectedNeighborhoodId || '');
      if (buildingImage) {
        formData.append('image', buildingImage);
      }

      let response;
      if (editingBuildingId) {
        response = await api.put(`/buildings/${editingBuildingId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('건물이 성공적으로 수정되었습니다.');
      } else {
        response = await api.post('/buildings', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('건물이 성공적으로 추가되었습니다.');
      }

      // 폼 초기화
      setBuildingName('');
      setBuildingAddress('');
      setBuildingDescription('');
      setBuildingFloors(1);
      setBuildingImage(null);
      setEditingBuildingId(null);

      // 건물 목록 새로고침
      if (selectedNeighborhoodId) {
        fetchBuildings(selectedNeighborhoodId);
      }
    } catch (error) {
      console.error('건물 저장 에러:', error);
      setMessage('건물 저장에 실패했습니다.');
    }
  };

  const handleBuildingDelete = async (id: string) => {
    try {
      await api.delete(`/buildings/${id}`);
      setMessage('건물이 성공적으로 삭제되었습니다.');
      setIsError(false);
      fetchBuildings(selectedNeighborhoodId);
    } catch (error) {
      console.error('건물 삭제 중 오류 발생:', error);
      setMessage('건물 삭제에 실패했습니다.');
      setIsError(true);
    }
  };

  // 호실 관련 함수들
  const fetchRooms = async (buildingId: string) => {
    try {
      console.log('호실 목록 요청:', buildingId);
      const response = await api.get(`/rooms/building/${buildingId}`);
      console.log('호실 목록 응답:', response.data);
      setRooms(response.data);
    } catch (error) {
      console.error('호실 목록을 불러오는데 실패했습니다:', error);
      setRooms([]);
    }
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', roomName);
      formData.append('buildingId', selectedBuildingId);
      formData.append('roomNumber', roomNumber);
      formData.append('size', roomSize);
      formData.append('price', roomPrice.toString());
      formData.append('floor', roomFloor.toString());
      formData.append('description', roomDescription);
      formData.append('area', roomArea.toString());

      if (roomImage) {
        console.log('[파일 업로드] 호실 이미지:', roomImage.name);
        formData.append('image', roomImage);
      }

      if (roomPanoramas.length > 0) {
        console.log('[파일 업로드] 파노라마 이미지 개수:', roomPanoramas.length);
        roomPanoramas.forEach((panorama, index) => {
          console.log(`[파일 업로드] 파노라마 ${index + 1}:`, panorama.name);
          formData.append('panoramas', panorama);
        });
        formData.append('panoramaTags', JSON.stringify(panoramaTags));
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // 60초로 타임아웃 증가
      };

      if (editingRoomId) {
        await api.put(`/rooms/${editingRoomId}`, formData, config);
        setMessage('호실이 성공적으로 수정되었습니다.');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await api.post('/rooms', formData, config);
        console.log('[호실 등록 응답]:', response.data);
        setMessage('호실이 성공적으로 등록되었습니다.');
      }

      setIsError(false);
      setRoomName('');
      setRoomNumber('');
      setRoomSize('');
      setRoomPrice(0);
      setRoomFloor(1);
      setRoomDescription('');
      setRoomImage(null);
      setRoomPanoramas([]);
      setPanoramaTags([]);
      setEditingRoomId(null);
      setRoomArea(0);
      fetchRooms(selectedBuildingId);
    } catch (error) {
      console.error('호실 저장 에러:', error);
      setMessage('호실 저장에 실패했습니다.');
      setIsError(true);
    }
  };

  const handleRoomDelete = async (id: string) => {
    try {
      await api.delete(`/rooms/${id}`);
      setMessage('호실이 성공적으로 삭제되었습니다.');
      setIsError(false);
      if (selectedBuildingId) {
        fetchRooms(selectedBuildingId);
      }
    } catch (error) {
      console.error('호실 삭제 중 오류 발생:', error);
      setMessage('호실 삭제에 실패했습니다.');
      setIsError(true);
    }
  };

  const handlePanoramaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      alert('파노라마 이미지는 최대 10개까지만 업로드할 수 있습니다.');
      return;
    }
    setRoomPanoramas(files);
    setPanoramaTags(new Array(files.length).fill(''));
  };

  const handlePanoramaTagChange = (index: number, value: string) => {
    const newTags = [...panoramaTags];
    newTags[index] = value;
    setPanoramaTags(newTags);
  };

  // 수정 시작 함수들
  const startNeighborhoodEdit = (neighborhood: any) => {
    setNeighborhoodName(neighborhood.name);
    setNeighborhoodDescription(neighborhood.description);
    setEditingNeighborhoodId(neighborhood._id);
  };

  const startBuildingEdit = (building: any) => {
    setBuildingName(building.name);
    setBuildingAddress(building.address);
    setBuildingDescription(building.description);
    setBuildingFloors(building.floors);
    setEditingBuildingId(building._id);
    setSelectedNeighborhoodId(building.neighborhoodId);
  };

  const startRoomEdit = (room: any) => {
    setRoomName(room.name);
    setRoomNumber(room.number);
    setRoomSize(room.size.toString());
    setRoomPrice(room.price);
    setRoomFloor(room.floor);
    setRoomDescription(room.description);
    setRoomArea(room.area || 0);
    setEditingRoomId(room._id);
    setPanoramaTags(room.panoramas?.map((p: any) => p.tag) || []);
  };

  // 수정 취소 함수들
  const cancelEdit = () => {
    setEditingNeighborhoodId(null);
    setEditingBuildingId(null);
    setEditingRoomId(null);
    setNeighborhoodName('');
    setNeighborhoodDescription('');
    setNeighborhoodImage(null);
    setBuildingName('');
    setBuildingAddress('');
    setBuildingDescription('');
    setBuildingFloors(1);
    setBuildingImage(null);
    setRoomName('');
    setRoomNumber('');
    setRoomSize('');
    setRoomPrice(0);
    setRoomFloor(1);
    setRoomDescription('');
    setRoomImage(null);
    setRoomPanoramas([]);
    setPanoramaTags([]);
  };

  // 동네 선택 핸들러
  const handleNeighborhoodSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedNeighborhoodId(id);
    if (id) {
      fetchBuildings(id);
    } else {
      setBuildings([]);
    }
    setSelectedBuildingId('');
    setRooms([]);
  };

  // 건물 선택 핸들러
  const handleBuildingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedBuildingId(id);
    if (id) {
      fetchRooms(id);
    } else {
      setRooms([]);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/consultations/export-excel`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `상담신청내역_${new Date().toLocaleDateString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('엑셀 파일 다운로드 중 오류 발생:', error);
      alert('엑셀 파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <Container>
      <HomeButton />
      <Title>관리자 설정</Title>

      {/* 엑셀 다운로드 버튼 */}
      <DownloadButton onClick={handleDownloadExcel}>
        상담 신청 내역 다운로드
      </DownloadButton>

      {/* 사이트 설정 섹션 */}
      <Section>
        <SectionTitle>사이트 설정</SectionTitle>
        <Form onSubmit={handleSettingsSubmit}>
          <FormGroup>
            <Label htmlFor="customLinkUrl">버튼 URL</Label>
            <Input
              id="customLinkUrl"
              type="url"
              value={customLinkUrl}
              onChange={(e) => setCustomLinkUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="customLinkText">버튼 텍스트</Label>
            <Input
              id="customLinkText"
              type="text"
              value={customLinkText}
              onChange={(e) => setCustomLinkText(e.target.value)}
              placeholder="회사 홈페이지"
              required
            />
          </FormGroup>
          <Button type="submit">설정 저장</Button>
        </Form>
      </Section>

      {/* 동네 관리 섹션 */}
      <Section>
        <SectionTitle>동네 관리</SectionTitle>
        <Form onSubmit={handleNeighborhoodSubmit}>
          <FormGroup>
            <Label htmlFor="neighborhoodName">동네 이름</Label>
            <Input
              id="neighborhoodName"
              type="text"
              value={neighborhoodName}
              onChange={(e) => setNeighborhoodName(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="neighborhoodDescription">동네 설명</Label>
            <TextArea
              id="neighborhoodDescription"
              value={neighborhoodDescription}
              onChange={(e) => setNeighborhoodDescription(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="neighborhoodImage">동네 이미지</Label>
            <Input
              id="neighborhoodImage"
              type="file"
              accept="image/*"
              onChange={(e) => setNeighborhoodImage(e.target.files?.[0] || null)}
              required={!editingNeighborhoodId}
            />
          </FormGroup>
          <Button type="submit">
            {editingNeighborhoodId ? '동네 수정' : '동네 추가'}
          </Button>
          {editingNeighborhoodId && (
            <Button type="button" onClick={cancelEdit}>
              취소
            </Button>
          )}
        </Form>
        <Table>
          <thead>
            <tr>
              <Th>이름</Th>
              <Th>설명</Th>
              <Th>작업</Th>
            </tr>
          </thead>
          <tbody>
            {neighborhoods.map((neighborhood) => (
              <tr key={neighborhood._id}>
                <Td>{neighborhood.name}</Td>
                <Td>{neighborhood.description}</Td>
                <Td>
                  <EditButton onClick={() => startNeighborhoodEdit(neighborhood)}>
                    수정
                  </EditButton>
                  <DeleteButton onClick={() => handleNeighborhoodDelete(neighborhood._id)}>
                    삭제
                  </DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      {/* 건물 관리 섹션 */}
      <Section>
        <SectionTitle>건물 관리</SectionTitle>
        <Form onSubmit={handleBuildingSubmit}>
          <FormGroup>
            <Label htmlFor="selectedNeighborhoodId">동네 선택</Label>
            <select
              id="selectedNeighborhoodId"
              value={selectedNeighborhoodId}
              onChange={handleNeighborhoodSelect}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">동네를 선택하세요</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood._id} value={neighborhood._id}>
                  {neighborhood.name}
                </option>
              ))}
            </select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="buildingName">건물 이름</Label>
            <Input
              id="buildingName"
              type="text"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="buildingAddress">주소</Label>
            <Input
              id="buildingAddress"
              type="text"
              value={buildingAddress}
              onChange={(e) => setBuildingAddress(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="buildingDescription">건물 설명</Label>
            <TextArea
              id="buildingDescription"
              value={buildingDescription}
              onChange={(e) => setBuildingDescription(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="buildingFloors">층수</Label>
            <Input
              id="buildingFloors"
              type="number"
              placeholder="층수"
              value={buildingFloors}
              onChange={(e) => setBuildingFloors(parseInt(e.target.value) || 1)}
              required
              min="1"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="buildingImage">건물 이미지</Label>
            <Input
              id="buildingImage"
              type="file"
              accept="image/*"
              onChange={(e) => setBuildingImage(e.target.files?.[0] || null)}
              required={!editingBuildingId}
            />
          </FormGroup>
          <Button type="submit">
            {editingBuildingId ? '건물 수정' : '건물 추가'}
          </Button>
          {editingBuildingId && (
            <Button type="button" onClick={cancelEdit}>
              취소
            </Button>
          )}
        </Form>
        <Table>
          <thead>
            <tr>
              <Th>이름</Th>
              <Th>주소</Th>
              <Th>층수</Th>
              <Th>작업</Th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((building) => (
              <tr key={building._id}>
                <Td>{building.name}</Td>
                <Td>{building.address}</Td>
                <Td>{building.floors}</Td>
                <Td>
                  <EditButton onClick={() => startBuildingEdit(building)}>
                    수정
                  </EditButton>
                  <DeleteButton onClick={() => handleBuildingDelete(building._id)}>
                    삭제
                  </DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      {/* 호실 관리 섹션 */}
      <Section>
        <SectionTitle>호실 관리</SectionTitle>
        <Form onSubmit={handleRoomSubmit}>
          <FormGroup>
            <Label htmlFor="selectedBuildingId">건물 선택</Label>
            <select
              id="selectedBuildingId"
              value={selectedBuildingId}
              onChange={handleBuildingSelect}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">건물을 선택하세요</option>
              {buildings.map((building) => (
                <option key={building._id} value={building._id}>
                  {building.name}
                </option>
              ))}
            </select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="roomName">호실 이름</Label>
            <Input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="roomNumber">호수</Label>
            <Input
              id="roomNumber"
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="roomSize">면적(평)</Label>
            <Input
              id="roomSize"
              type="number"
              placeholder="면적"
              value={roomSize}
              onChange={(e) => setRoomSize(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="roomPrice">가격(만 원)</Label>
            <Input
              id="roomPrice"
              type="number"
              placeholder="가격"
              value={roomPrice}
              onChange={(e) => setRoomPrice(parseInt(e.target.value))}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="roomFloor">층</Label>
            <Input
              id="roomFloor"
              type="number"
              placeholder="층"
              value={roomFloor}
              onChange={(e) => setRoomFloor(parseInt(e.target.value))}
              required
              min="1"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="roomDescription">호실 설명</Label>
            <TextArea
              id="roomDescription"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="roomImage">호실 이미지</Label>
            <Input
              id="roomImage"
              type="file"
              accept="image/*"
              onChange={(e) => setRoomImage(e.target.files?.[0] || null)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="roomPanoramas">파노라마 이미지 (최대 10개)</Label>
            <Input
              id="roomPanoramas"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePanoramaChange}
            />
            {roomPanoramas.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                {roomPanoramas.map((panorama, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem' }}>
                    <Label>파노라마 {index + 1} 태그</Label>
                    <Input
                      type="text"
                      value={panoramaTags[index] || ''}
                      onChange={(e) => handlePanoramaTagChange(index, e.target.value)}
                      placeholder="예: 거실, 침실, 주방 등"
                    />
                  </div>
                ))}
              </div>
            )}
          </FormGroup>
          <Button type="submit">
            {editingRoomId ? '호실 수정' : '호실 등록'}
          </Button>
          {editingRoomId && (
            <Button type="button" onClick={cancelEdit}>
              취소
            </Button>
          )}
        </Form>
        <Table>
          <thead>
            <tr>
              <Th>이름</Th>
              <Th>호수</Th>
              <Th>면적</Th>
              <Th>가격</Th>
              <Th>층</Th>
              <Th>작업</Th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id}>
                <Td>{room.name}</Td>
                <Td>{room.number}</Td>
                <Td>{room.size}m²</Td>
                <Td>{room.price.toLocaleString()}원</Td>
                <Td>{room.floor}</Td>
                <Td>
                  <EditButton onClick={() => startRoomEdit(room)}>
                    수정
                  </EditButton>
                  <DeleteButton onClick={() => handleRoomDelete(room._id)}>
                    삭제
                  </DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      {message && (
        <Message isError={isError}>{message}</Message>
      )}
    </Container>
  );
};

export default AdminPage; 