'use client'

import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState, RefObject} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { easing, vector3 } from "maath";
import {
	a,
	animated,
	useSpring,
} from "@react-spring/three";
// import vertexShader from '@/components/shaders/locker/vertex.glsl'
// import fragmentShader from '@/components/shaders/locker/frag.glsl'
import {
	// Sky,
	useGLTF,
	useHelper,
	useTexture,
	OrbitControls,
} from '@react-three/drei';
import {
	Fog,
	Mesh,
	Group,
	Color,
	Euler,
	Vector3,
	ShaderMaterial,
	DirectionalLight,
	DirectionalLightHelper,
	BufferGeometry,
} from 'three';

const RED: string = 'red'
const PRIMECOLOR: string = 'white'

function Light () {
	const dirLight1 = useRef<DirectionalLightHelper>(null!)
	const dirLight2 = useRef<DirectionalLightHelper>(null!)
	const dirLight3 = useRef<DirectionalLightHelper>(null!)
	useHelper(dirLight1, DirectionalLightHelper, 5, 'blue');
	useHelper(dirLight2, DirectionalLightHelper, 5, 'red');
	useHelper(dirLight3, DirectionalLightHelper, 5, 'yellow');

	// const spLight = useRef<SpotLightHelper>(null!)
	// useHelper(spLight, SpotLightHelper, 'red');
	// useEffect(() => {
	// 	const l = dirLight3.current!
	// 	l.target.position.set(0, 10, 0)  // where to look
	// 	l.target.updateMatrixWorld()
	// }, [])

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
			<directionalLight
				ref={dirLight3}
				castShadow
				color='white'
				intensity={.05}
				rotateOnAxis={90}
				position={[0, 10, 5]}
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
	pos: number | Vector3
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

type PakProps = {
	title: string;
	coverURL: string;
	color: string;
	pos: [number, number, number] | number | Vector3;
	rot: Euler;
}
function GamePak({ title, coverURL, color, pos, rot }: PakProps) {
	const cover = useTexture(`/pak/${coverURL}`)
	cover.flipY = false
	cover.repeat.set(1.4,1.75)
	cover.offset.set(-.21, -.52)
	const { nodes } = useGLTF('/models/game-pak.glb');
	const pakMesh = nodes.pak as Mesh<BufferGeometry>
	const pakCoverMesh = nodes.pakCover as Mesh<BufferGeometry>

	return (
		<group dispose={null}>
			<mesh
				castShadow
				receiveShadow
				position={pos}
				rotation={rot}
				geometry={pakMesh.geometry}
			>
				<mesh
					castShadow
					receiveShadow
					geometry={pakCoverMesh.geometry}
				>
					<meshStandardMaterial
						map={cover}
						color="#ffffff"
						emissive="#ffffff"
						emissiveMap={cover}
						emissiveIntensity={.75}
						metalness={.4}
						roughness={0.8}
					/>
				</mesh>
				<meshStandardMaterial
					color={color}
					metalness={.5}
					roughness={0.5}
				/>
			</mesh>
		</group>
	)
}

type PakPakProps = {
	paks?: [PakProps,PakProps,PakProps];
	pos: [number, number, number] | number | Vector3;
	lockerClick: (page: string) => void
}
function PakPak({ paks, pos, lockerClick }: PakPakProps) {
	const pakGroup = useRef<Group>(null!)
	const [hover, setHover] = useState(false)
	const [click, setClick] = useState(false)
	const clickFlag = useRef(click)
	const AnimatedGamePak = animated(GamePak)

	const testPaks: [PakProps,PakProps,PakProps] = [
		{ title:'DK', coverURL:'dk.jpg', color:'chartreuse', pos:new Vector3(.4,.1,.3), rot:new Euler(0,0,-0.2) },
		{ title:'Zelda', coverURL:'zelda.webp', color:'dodgerblue', pos:new Vector3(0,0,0), rot:new Euler(0,0,-0.2) },
		{ title:'Zelda', coverURL:'zelda.webp', color:'darkviolet', pos:new Vector3(-.4,-.1,-.3), rot:new Euler(0,0,-0.2) }
	]

	const [{ pakTwirl }] = useSpring({
		pakTwirl: hover ? Math.PI * 2 : 0
	}, [hover])

	function aniBob (i: number, child: Group, time: number, delta: number) { return child.position.z + (0.1 + (i / 90)) * Math.sin(10 * time + delta) }
	function aniDelay (i: number): number {
		return 0.05 + i * 0.06
	}
	useFrame(({ clock }, dt, current) => {
		pakGroup.current?.children.forEach((child: any, i: number) => {
			if (child.type === "Group") {
				easing.damp(child.rotation, 'x', pakTwirl.get(), aniDelay(i), dt)
				easing.damp(child.position, 'y', aniBob(i, child, clock.elapsedTime, dt), aniDelay(i), dt)

				if (clickFlag.current !== click) {
					setClick(false)
					easing.damp(child.rotation, 'x', child.rotation.x += -Math.PI * 2, 100, dt)
				}
			}
		})
	})

	function pakPakClick () {
		setClick(true)
		setTimeout(() => lockerClick('paks'), 375)
	}

	return (
		<mesh
			ref={pakGroup}
			position={pos}
			onClick={(e) => { e.stopPropagation(); pakPakClick() }}
			onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
			onPointerOut={(e) => { e.stopPropagation(); setHover(false) }}
		>
			{testPaks.map((p, i) => (
				<AnimatedGamePak
					key={i}
					{...p}
				/>
			))}
			<boxGeometry
				args={[1.5,1.5,1.5]}
			/>
			<meshBasicMaterial
				color="hotpink" // A color for visual debugging
				transparent
				opacity={0} // Make it completely invisible
			/>
		</mesh>
	);
}

type LockerProps = {
	lockerRef: RefObject<Group | null>
}
function Locker ({ lockerRef }: LockerProps) {
	const router = useRouter();
	const locker = useRef<Mesh>(null!)
	const lockerDoor = useRef<Mesh>(null!)
	const glow = useRef<Mesh>(null!)
	const prevCamPos = useRef<Vector3>(new Vector3())
	const [theta, setTheta] = useState(0)
	const [clicked, setClicked] = useState(false)
	const closedFlag = useRef(clicked)
	const openFlag = useRef(!clicked)

	const { nodes } = useGLTF('/models/locker-v1.glb');
	const lockerMesh = nodes.locker as Mesh<BufferGeometry>
	const lockerDoorMesh = nodes['locker-door'] as Mesh<BufferGeometry>
	const lockerHandleMesh = nodes['right-handle'] as Mesh<BufferGeometry>

	const lockerClick = (page: string) => {
		console.log(`Redirect to ${page}...`)
		router.push('/paks')
	}

	// const lockerShader = new ShaderMaterial({ vertexShader, fragmentShader })
	// console.log(nodes.locker.geometry.attributes)

	// Locker Settings
	const LOCKER_ROUGHNESS: number = 0.25

	// Locker Content Positions
	const LOCKER_TOP = new Vector3(0,6.5,.5)
	const LOCKER_MID = new Vector3(0,4.8,.5)
	const LOCKER_BTM = new Vector3(0,3,.5)

	const [{ rotX, rotY, posZ, scaleZ, light }] = useSpring({
		rotX: clicked ? -Math.PI / -55 : 0,
		rotY: clicked ? -Math.PI / 1.6 : 0,
		scaleZ: clicked ? 0 : 1,
		light: clicked ? 0 : 10,
		posZ: clicked ? 10 : 0,
		config: { tension: 200, friction: 14 },
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
					geometry={lockerMesh.geometry}
					position={[-0.005, 4.341, -0.223]}
				>
					<meshStandardMaterial metalness={1} roughness={LOCKER_ROUGHNESS} color={PRIMECOLOR} />
				</mesh>
				<a.mesh
					ref={lockerDoor}
					castShadow
					receiveShadow
					geometry={lockerDoorMesh.geometry}
					position={[-1.251, 4.819, 1.562]}
					rotation-y={rotY}
					rotation-x={rotX}
				>
					<mesh
						castShadow
						receiveShadow
						geometry={lockerHandleMesh.geometry}
						position={[2.046, -0.728, 0.28]}
						rotation={[0, 0, -0.033]}
					>
						<meshStandardMaterial metalness={1} roughness={LOCKER_ROUGHNESS} color="gold" />
					</mesh>
					<meshStandardMaterial metalness={1} roughness={LOCKER_ROUGHNESS} color={PRIMECOLOR} />
				</a.mesh>
				{clicked && (
					<>
						<PakPak pos={LOCKER_TOP} lockerClick={lockerClick}/>
						{/* <InLocker pos={LOCKER_TOP} /> */}
						<InLocker pos={LOCKER_MID} />
						<InLocker pos={LOCKER_BTM} />
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
					gl.setClearColor('yellow', 1)
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

