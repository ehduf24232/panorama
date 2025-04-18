import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 1000;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  opacity: 1;
  transition: opacity 0.5s ease;
  
  &.loaded {
    opacity: 0;
    pointer-events: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ViewerInfo = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-radius: 20px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  letter-spacing: -0.01em;
  opacity: 0.8;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    bottom: 20px;
    font-size: 13px;
    padding: 10px 20px;
  }
`;

const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const PanoramaSelector = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-radius: 20px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  letter-spacing: -0.01em;
  opacity: 0.8;
  transition: opacity 0.3s ease;
  max-width: 90%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  &:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    bottom: 70px;
    font-size: 12px;
    padding: 8px 16px;
    gap: 4px;
  }
`;

const PanoramaButton = styled.button<{ isActive?: boolean }>`
  background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  margin: 0 4px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
    margin: 0 2px;
  }
`;

interface Panorama {
  url: string;
  tag: string;
}

interface PanoramaViewerProps {
  panoramas: Panorama[];
}

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ panoramas }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const distanceRef = useRef(100); // 카메라와 구체 사이의 거리

  useEffect(() => {
    if (!containerRef.current || panoramas.length === 0) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 초기 파노라마 로드
    loadPanorama(panoramas[0].url);

    // 애니메이션 설정
    let lon = 0;
    let lat = 0;
    let phi = 0;
    let theta = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      camera.position.x = distanceRef.current * Math.sin(phi) * Math.cos(theta);
      camera.position.y = distanceRef.current * Math.cos(phi);
      camera.position.z = distanceRef.current * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };

    animate();

    // 마우스/터치 이벤트 처리
    let isUserInteracting = false;
    let onPointerDownMouseX = 0;
    let onPointerDownMouseY = 0;
    let onPointerDownLon = 0;
    let onPointerDownLat = 0;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (event.target instanceof HTMLButtonElement) {
        return;
      }
      
      event.preventDefault();
      isUserInteracting = true;
      
      if ('touches' in event) {
        onPointerDownMouseX = event.touches[0].clientX;
        onPointerDownMouseY = event.touches[0].clientY;
      } else {
        onPointerDownMouseX = event.clientX;
        onPointerDownMouseY = event.clientY;
      }
      
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      if (!isUserInteracting) return;
      event.preventDefault();

      let clientX, clientY;
      
      if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      lon = (onPointerDownMouseX - clientX) * 0.1 + onPointerDownLon;
      lat = (clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
    };

    const onPointerUp = (event: MouseEvent | TouchEvent) => {
      if (event.target instanceof HTMLButtonElement) {
        return;
      }
      isUserInteracting = false;
    };

    // 마우스 휠 이벤트 처리
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY;
      // 확대/축소 범위 제한 (50 ~ 200)
      distanceRef.current = Math.max(50, Math.min(200, distanceRef.current + delta * 0.1));
    };

    // 이벤트 리스너 등록
    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mouseup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    
    // 터치 이벤트 리스너 등록
    container.addEventListener('touchstart', onPointerDown, { passive: false });
    container.addEventListener('touchmove', onPointerMove, { passive: false });
    container.addEventListener('touchend', onPointerUp, { passive: false });

    // 창 크기 변경 처리
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 클린업 함수
    return () => {
      if (container) {
        container.removeEventListener('mousedown', onPointerDown);
        container.removeEventListener('mousemove', onPointerMove);
        container.removeEventListener('mouseup', onPointerUp);
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('touchstart', onPointerDown);
        container.removeEventListener('touchmove', onPointerMove);
        container.removeEventListener('touchend', onPointerUp);
      }
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (container && rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, [panoramas]);

  const loadPanorama = (url: string) => {
    if (!url) {
      console.error('[파노라마] URL이 없습니다.');
      return;
    }

    // URL이 이미 전체 URL인 경우 그대로 사용
    const fullUrl = url.startsWith('http') 
      ? url 
      : `${process.env.REACT_APP_API_URL || 'https://panorama-backend.onrender.com'}${url}`;

    console.log('[파노라마] 이미지 로드 시작:', fullUrl);

    const loader = new THREE.TextureLoader();
    loader.load(
      fullUrl,
      (texture) => {
        console.log('[파노라마] 이미지 로드 성공');
        
        // 새로운 구체 생성 또는 기존 구체 재사용
        if (!sphereRef.current) {
          const geometry = new THREE.SphereGeometry(500, 60, 40);
          geometry.scale(-1, 1, 1);
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const sphere = new THREE.Mesh(geometry, material);
          sphereRef.current = sphere;
          if (sceneRef.current) {
            sceneRef.current.add(sphere);
          } else {
            console.error('Scene이 초기화되지 않았습니다.');
          }
        } else {
          // 기존 재질의 텍스처만 업데이트
          if (sphereRef.current.material instanceof THREE.Material) {
            if (sphereRef.current.material instanceof THREE.MeshBasicMaterial) {
              sphereRef.current.material.map = texture;
              sphereRef.current.material.needsUpdate = true;
            }
          }
        }
        
        setIsLoading(false);
      },
      (xhr) => {
        console.log('[파노라마] 로딩 진행률:', (xhr.loaded / xhr.total * 100) + '%');
      },
      (error) => {
        console.error('[파노라마] 이미지 로드 실패:', error);
        setIsLoading(false);
      }
    );
  };

  const handlePanoramaChange = (index: number) => {
    setCurrentPanoramaIndex(index);
    loadPanorama(panoramas[index].url);
  };

  return (
    <Container>
      <ViewerContainer ref={containerRef}>
        <LoadingOverlay className={isLoading ? '' : 'loaded'}>
          <LoadingSpinner />
        </LoadingOverlay>
        {panoramas.length > 1 && (
          <PanoramaSelector>
            {panoramas.map((panorama, index) => (
              <PanoramaButton
                key={index}
                isActive={index === currentPanoramaIndex}
                onClick={() => handlePanoramaChange(index)}
              >
                {panorama.tag || `파노라마 ${index + 1}`}
              </PanoramaButton>
            ))}
          </PanoramaSelector>
        )}
        <ViewerInfo>
          마우스로 드래그하여 주변을 둘러보세요
        </ViewerInfo>
      </ViewerContainer>
    </Container>
  );
};

export default PanoramaViewer; 