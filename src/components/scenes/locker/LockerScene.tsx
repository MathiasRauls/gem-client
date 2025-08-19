'use client'

import { useRef, useEffect, useState, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { easing, vector3 } from "maath";
import { a, useSpring, config as springCfg } from "@react-spring/three";
// import vertexShader from '@/components/shaders/locker/vertex.glsl'
// import fragmentShader from '@/components/shaders/locker/frag.glsl'
import {
	Sky,
	useGLTF,
	useCursor,
	useHelper,
	OrbitControls,
	MeshDistortMaterial,
} from '@react-three/drei';
import {
	Fog,
	Mesh,
	Group,
	Color,
	Euler,
	Vector3,
	Material,
	DoubleSide,
	ShaderMaterial,
	SpotLightHelper,
	DirectionalLight,
	DirectionalLightHelper,
} from 'three';

const RED: string = 'red'
const PRIMECOLOR: string = 'white'

function Light () {
	const dirLight1 = useRef<DirectionalLightHelper>(null!)
	const dirLight2 = useRef<DirectionalLightHelper>(null!)
	useHelper(dirLight1, DirectionalLightHelper, 5, 'blue');
	useHelper(dirLight2, DirectionalLightHelper, 5, 'red');

	// const spLight = useRef<SpotLightHelper>(null!)
	// useHelper(spLight, SpotLightHelper, 'red');

	return (
		<>
			<ambientLight intensity={1}/>
			<directionalLight
				ref={dirLight1}
				castShadow
				color='white'
				intensity={2}
				position={[-1, 10, 6]}
				shadow-normalBias={0.002}
				shadow-mapSize={[1024, 1024]}
			>
				<orthographicCamera
					attach='shadow-camera'
					args={[-10, 10, 10, -10]}
				/>
			</directionalLight>
			<directionalLight
				ref={dirLight2}
				castShadow
				color='white'
				intensity={1}
				position={[10, 10, 1]}
				shadow-normalBias={0.002}
				shadow-mapSize={[1024, 1024]}
			>
			</directionalLight>
			{/* <spotLight
				ref={spLight}
				position={[10, 10, 10]}
				angle={0.3}
				penumbra={1}
				intensity={1.2}
				castShadow
			/> */}
		</>
	)
}

function FogMachine() {
	const { scene } = useThree()

	useEffect(() => {
		scene.fog = new Fog(RED, 10, 50)
		scene.background = new Color(RED)
	}, [scene])

	return null
}

type InLockerProps = {
	pos: Vector3
}
function InLocker ({ pos }: InLockerProps) {
	const elem = useRef<Mesh>(null!)
	const [hover, setHover] = useState(false)

	const [{ twirl }] = useSpring({
		twirl: hover ? -Math.PI : 0
	}, [hover])

	useFrame((_, dt) => {
		easing.damp(elem.current.rotation, "y", twirl.get(), 0.05, dt)
	})

	return (
		<mesh
			ref={elem}
			position={pos}
			onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
			onPointerOut={(e) => { e.stopPropagation(); setHover(false) }}
		>
			<boxGeometry
				args={[1.5,1.5,1.5]}
			/>
			<meshStandardMaterial color={'green'} />
		</mesh>
	);
}

type LockerProps = {
	lockerRef: RefObject<Group | null>
}
function Locker ({ lockerRef }: LockerProps) {
	const locker = useRef<Mesh>(null!)
	const lockerDoor = useRef<Mesh>(null!)
	const lockerClicked = useRef(false)
	const glow = useRef<Mesh>(null!)
	const prevCamPos = useRef<Vector3>(new Vector3())
	const { nodes, materials } = useGLTF('/models/locker-v1.glb');
	const [theta, setTheta] = useState(0)
	const [clicked, setClicked] = useState(false)
	const closedFlag = useRef(clicked)
	const openFlag = useRef(!clicked)
	// const lockerShader = new ShaderMaterial({ vertexShader, fragmentShader })
	// console.log(nodes.locker.geometry.attributes)

	// Locker Settings
	const LOCKER_ROUGHNESS: number = 0.25

	const [{ rotX, rotY, posZ, scaleZ, light }] = useSpring({
		rotX: clicked ? -Math.PI / -55 : 0,
		rotY: clicked ? -Math.PI / 1.6 : 0,
		scaleZ: clicked ? 0 : 1,
		light: clicked ? 0 : 10,
		posZ: clicked ? 10 : 0,
		config: { tension: 200, friction: 14 }
	}, [clicked])

	useFrame(({ clock, camera }, dt, current) => {
		// camera.lookAt(locker.current.position.clone().add(new Vector3(0,4,0)))
		const rad = .005
    	const speed = 0.01 // lower = slower
		setTheta(prev => prev + speed)

		locker.current.rotation.x = 2 * rad * Math.sin(theta)
		locker.current.rotation.z = 5 * rad * Math.sin(theta)
		locker.current.rotation.y = (rad / 2) * Math.cos(theta)
		locker.current.position.y += rad * Math.sin(theta)

		glow.current.rotation.x = 2 * rad * Math.sin(theta)
		glow.current.rotation.z = 5 * rad * Math.sin(theta)
		glow.current.rotation.y = (rad / 2) * Math.cos(theta)
		glow.current.position.y += rad * Math.sin(theta)

		// Glow
		const glowZ = clicked ? 0 : 0
		const glowZScale = clicked ? 0 : 1
		const glowYScale = clicked ? 0 : 1
		const glowEmission = clicked ? 0 : 10
		easing.damp(glow.current.scale, "y", glowYScale, 0.05, dt)
		easing.damp(glow.current.scale, "z", glowZScale, 0.05, dt)
		easing.damp(glow.current.position, "z", glowZ, 0.05, dt)
		easing.damp(glow.current.material, "emissiveIntensity", glowEmission, 1, dt)

		// Locker Door
		easing.damp(lockerDoor.current.rotation, "y", rotY.get(), 0.65, dt)
		easing.damp(lockerDoor.current.rotation, "x", rotX.get(), 0.65, dt)

		// Camera
		prevCamPos.current.copy(camera.position)
		const camTargetPos = clicked ? new Vector3(1,15,5) : prevCamPos.current.clone().add(new Vector3(15,-9,15))
		if (closedFlag.current !== clicked) {
			camera.lookAt(locker.current.position.clone().add(new Vector3(-1,4.1,0)))
			camera.position.lerp(camTargetPos, 0.08);
		}
		if (openFlag.current !== clicked) {
			camera.position.lerp(camTargetPos, 0.04);
			camera.lookAt(locker.current.position.clone().add(new Vector3(0,4.1,0)))
		}
	})

	return (
		<group ref={lockerRef}>
			<group
				ref={locker}
				castShadow
				onClick={() => setClicked(true)}
				onPointerMissed={() => setClicked(false)}
				dispose={null}
				receiveShadow
				scale={[1,1,1]}
				rotation={[0,0,0]}
				position={[0,6,0]}
			>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.locker.geometry}
					position={[-0.005, 4.341, -0.223]}
				>
					<meshStandardMaterial metalness={1} roughness={LOCKER_ROUGHNESS} color={PRIMECOLOR} />
				</mesh>
				<a.mesh
					ref={lockerDoor}
					castShadow
					receiveShadow
					geometry={nodes['locker-door'].geometry}
					position={[-1.251, 4.819, 1.562]}
					rotation-y={rotY}
					rotation-x={rotX}
				>
					<mesh
						castShadow
						receiveShadow
						geometry={nodes['right-handle'].geometry}
						position={[2.046, -0.728, 0.28]}
						rotation={[0, 0, -0.033]}
					>
						<meshStandardMaterial metalness={1} roughness={LOCKER_ROUGHNESS} color="gold" />
					</mesh>
					<meshStandardMaterial metalness={1} roughness={LOCKER_ROUGHNESS} color={PRIMECOLOR} />
				</a.mesh>
				{clicked && (
					<>
						<InLocker pos={[0,6.5,.5]} />
						<InLocker pos={[0,4.8,.5]} />
						<InLocker pos={[0,3,.5]} />
					</>
				)}
			</group>
			<a.mesh
				ref={glow}
				position={[0,10.8,0]}
			>
				<boxGeometry
					args={[3.3, 6, 2]}
				/>
				<meshStandardMaterial
					emissive="#00FF00"
					emissiveIntensity={10}
				/>
			</a.mesh>
		</group>
	);
}

// function Floor () {
// 	const floor = useRef<Mesh>(null!)
// 	return (
// 		<mesh receiveShadow rotation={[-Math.PI / 2,0,0]} position={[0, -1.5, 0]} ref={floor}>
// 			<planeGeometry args={[100, 100]}/>
// 			<meshStandardMaterial side={DoubleSide} color={PRIMECOLOR} />
// 		</mesh>
// 	);
// }

export default function LockerScene () {
	const locker = useRef<Group>(null!)

	return (
		<div className='h-screen w-screen'>
			<Canvas
				camera={{ position: [20,0,20], fov: 50 }}
				// fog={{ color: '#aaaaaa', near: 5, far: 20 }}
				gl={{ antialias: true }}
				onCreated={ ({ gl }) => {
					gl.setClearColor('black', 1)
					// gl.setClearColor('#00FF4C', 1)
				}}
			>
				{/* <color attach="background" args={['#362929']} /> */}
				{/* <Sky distance={450000} sunPosition={[0,-20,0]} inclination={0} azimuth={0.25} /> */}
				<Light />
				<Locker lockerRef={locker}/>
				{/* <FogMachine /> */}
				{/* <Floor /> */}
				<OrbitControls
					enableDamping
					minDistance={16}  // minimum zoom (closer = smaller number)
					maxDistance={25}
					enablePan={false}
					minAzimuthAngle={-Math.PI / 6}  // -45°
  					maxAzimuthAngle={Math.PI / 4}   // +45°
					minPolarAngle={Math.PI / 4}   // 30°
  					maxPolarAngle={Math.PI / 2}   // 90°
				/>
				<EffectComposer>
					<Bloom intensity={1.5} luminanceThreshold={1} luminanceSmoothing={0.9} />
				</EffectComposer>
			</Canvas>
		</div>
	);
}

