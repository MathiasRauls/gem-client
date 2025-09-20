'use client'

import { useControls } from 'leva';
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
	GizmoHelper,
	GizmoViewport,
	Environment,
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

const CONTROLS = false;

function Light () {
	const dirLight1 = useRef<DirectionalLightHelper>(null!)
	const dirLight2 = useRef<DirectionalLightHelper>(null!)
	const dirLight3 = useRef<DirectionalLightHelper>(null!)
	// useHelper(dirLight1, DirectionalLightHelper, 5, 'blue');
	// useHelper(dirLight3, DirectionalLightHelper, 5, 'yellow');
	// useHelper(dirLight2, DirectionalLightHelper, 5, 'red');
	// useHelper(dirLight4, DirectionalLightHelper, 5, 'white');

	// const spLight = useRef<SpotLightHelper>(null!)
	// useHelper(spLight, SpotLightHelper, 'red');
	// useEffect(() => {
	// 	const l = dirLight3.current!
	// 	l.target.position.set(0, 10, 0)  // where to look
	// 	l.target.updateMatrixWorld()
	// }, [])

	return (
		<>
			<ambientLight intensity={.25}/>
			<directionalLight
				ref={dirLight1}
				castShadow
				color='white'
				intensity={1}
				position={[-5, 20, 5]}
				shadow-normalBias={0.002}
				shadow-mapSize={[1024, 1024]}
			>
				{/* <orthographicCamera
					attach='shadow-camera'
					args={[-10, 10, 10, -10]}
				/> */}
			</directionalLight>
			{/* Sparkle Light */}
			{/* <directionalLight
				ref={dirLight3}
				castShadow
				color='white'
				intensity={1}
				position={[0, 30, -5]}
				shadow-normalBias={0.002}
				shadow-mapSize={[1024, 1024]}
			>
			</directionalLight> */}
			{/* <directionalLight
				ref={dirLight2}
				castShadow
				color='white'
				intensity={1}
				position={[10, 10, 1]}
				shadow-normalBias={0.02}
				shadow-mapSize={[1024, 1024]}
			>
			</directionalLight> */}
		</>
	)
}

const FOGCOLOR = 'black'
function FogMachine() {
	const { scene } = useThree()

	useEffect(() => {
		scene.fog = new Fog(FOGCOLOR, 40, 45)
		scene.background = new Color(FOGCOLOR)
	}, [scene])

	return null
}

type tNameProps  = {
	visible: boolean;
}
function Name({ visible }: tNameProps) {
	const { camera } = useThree();
	const vanderwolf = useRef<Group>(null!)
	const vanderwolfMesh = useRef<Mesh>(null!)
	const [theta, setTheta] = useState(0)
	const { nodes } = useGLTF('/models/vanderwolf.glb')
	const name = nodes.name as Mesh<BufferGeometry>

	// Lights
	const leftLightScale = new Vector3(40,40,40)
	const rightLightScale = new Vector3(40,40,40)
	const brightness = .3

	const nameLightLeft = useRef<DirectionalLight | null>(null)
	const nameLightLeftHelper = useRef<DirectionalLightHelper | null>(null)

	const nameLightRight = useRef<DirectionalLight | null>(null)
	const nameLightRightHelper = useRef<DirectionalLightHelper | null>(null)

	useFrame(({ clock, camera }, dt, current) => {
		const rad = .01
		const speed = 0.01 // lower = slower
		setTheta(prev => prev + speed)

		// visible && vanderwolfMesh.current.lookAt(camera.position)
		vanderwolf.current.rotation.x = 4 * rad * Math.sin(theta)
		vanderwolf.current.rotation.z = 2 * rad * Math.sin(theta)
		vanderwolf.current.rotation.y = 2 * rad * Math.sin(theta)
		vanderwolf.current.rotation.y = 4 * rad * Math.cos(theta)
		!visible
			? easing.damp(vanderwolf.current.position, "y", 20, 0.05, dt)
			: easing.damp(vanderwolf.current.position, "y", 0, 0.05, dt)

		const lightPosX = 5
		const lightPosY = 30
		const lightPosZ = 5

		// White
		const l = nameLightLeft.current!
		l.target.position.set(-10,20,0)  // where to look
		l.position.set(lightPosX, lightPosY, lightPosZ)

		// Red
		const r = nameLightRight.current!
		r.target.position.set(0,20,-10)  // where to look
		r.position.set(lightPosX, lightPosY, lightPosZ)
	})

	return (
		<>
			<directionalLight
				// ref={ nameLightLeftHelper }
				ref={(el) => {
					nameLightLeft.current = el;
					nameLightLeftHelper.current = el ? new DirectionalLightHelper(el, 5, 'white') : null;
				}}
				castShadow
				color='white'
				intensity={brightness}
				rotateOnAxis={90}
				scale={leftLightScale}
				position={[0,0,0]}
			>
			</directionalLight>
			<directionalLight
				// ref={ nameLightLeftHelper }
				ref={(el) => { nameLightRight.current = el; nameLightRightHelper.current = el ? new DirectionalLightHelper(el, 5, 'red') : null; }}
				castShadow
				color='white'
				intensity={brightness}
				rotateOnAxis={90}
				scale={rightLightScale}
				position={[0,0,0]}
			>
			</directionalLight>
			<group ref={vanderwolf} dispose={null}>
				<mesh
					ref={vanderwolfMesh}
					castShadow
					receiveShadow
					scale={250}
					position={[-13, 19, -10]}
					geometry={name.geometry}
					// rotation={[Math.PI / 1.7,Math.PI / 50,Math.PI / -4]}
					rotation={[0,Math.PI / 3.9,0]}
				>
					<meshStandardMaterial
						color={'goldenrod'}
						metalness={1}
						roughness={0.1}
					/>
				</mesh>
			</group>
		</>
	)
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
	onClick: () => void;
	onPointerMissed: () => void;
	enableControls: boolean;
	lockerRef: RefObject<Group | null>
}
function Locker ({ lockerRef, enableControls, onPointerMissed, onClick }: LockerProps) {
	const router = useRouter();
	const locker = useRef<Mesh>(null!)
	const lockerDoor = useRef<Mesh>(null!)
	const glow = useRef<Mesh>(null!)
	const prevCamPos = useRef<Vector3>(new Vector3())
	const [theta, setTheta] = useState(0)
	const [clicked, setClicked] = useState(false)
	const closedFlag = useRef(clicked)
	const openFlag = useRef(!clicked)

	const { nodes } = useGLTF('/models/locker-v1.glb')
	const lockerMesh = nodes.locker as Mesh<BufferGeometry>
	const lockerDoorMesh = nodes['locker-door'] as Mesh<BufferGeometry>
	const lockerHandleMesh = nodes['right-handle'] as Mesh<BufferGeometry>

	// Light
	const lockerLight = useRef<DirectionalLight>(null!)
	const lockerLightHelper = useRef<DirectionalLightHelper>(null!)
	useHelper(lockerLightHelper, DirectionalLightHelper, 5, 'yellow')

	const lockerClick = (page: string) => {
		router.push('/paks')
	}

	// const lockerShader = new ShaderMaterial({ vertexShader, fragmentShader })
	// console.log(nodes.locker.geometry.attributes)

	// Locker Settings
	const LOCKER_ROUGHNESS: number = 0.25
	const LOCKERCOLOR: string = 'lightslategrey'

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
		// setTimeout(() => {
		// }, 300)
		easing.damp(glow.current.scale, "y", glowYScale, 0.05, dt)
		easing.damp(glow.current.scale, "z", glowZScale, 0.05, dt)
		easing.damp(glow.current.position, "z", glowZ, 0.05, dt)
		easing.damp(glow.current.material, "emissiveIntensity", glowEmission, 5, dt)

		// Locker Door
		easing.damp(lockerDoor.current.rotation, "y", rotY.get(), 0.65, dt)
		easing.damp(lockerDoor.current.rotation, "x", rotX.get(), 0.65, dt)

		// Camera
		prevCamPos.current.copy(camera.position)
		const camTargetPos = clicked ? new Vector3(3,12,9) : new Vector3(15,2,15)
		if (closedFlag.current !== clicked) {
			camera.lookAt(locker.current.position.clone().add(new Vector3(-1,4.1,0)))
			enableControls && camera.position.lerp(camTargetPos, 0.08);
		}
		if (openFlag.current !== clicked) {
			enableControls && camera.position.lerp(camTargetPos, 0.04);
			camera.lookAt(locker.current.position.clone().add(new Vector3(0,4.1,0)))
		}

		// lockerLight.current.lookAt(locker.current.position)
		// lockerLightHelper.current.lookAt(locker.current.position)
	})

	return (
		<group ref={lockerRef} onClick={onClick} onPointerMissed={onPointerMissed} rotation={[.01,0,-.01]}>
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
				<directionalLight
					ref={(el) => {
						lockerLight.current = el;
						lockerLightHelper.current = el;
					}}
					castShadow
					color='white'
					intensity={.5}
					// scale={[1,4,1]}
					position={[0, 6, 5]}
					// rotateOnAxis={90}
					// shadow-normalBias={0.02}
					// shadow-mapSize={[1024, 1024]}
				>
				</directionalLight>
				<mesh
					castShadow
					receiveShadow
					geometry={lockerMesh.geometry}
					position={[-0.005, 4.341, -0.223]}
				>
					<meshStandardMaterial metalness={1} roughness={LOCKER_ROUGHNESS} color={LOCKERCOLOR} />
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
					<meshStandardMaterial metalness={1} roughness={LOCKER_ROUGHNESS} color={LOCKERCOLOR} />
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
// 			<meshStandardMaterial side={DoubleSide} color={LOCKERCOLOR} />
// 		</mesh>
// 	);
// }

export default function LockerScene () {
	const { controls } = useControls({
		controls: { value: true }
	});
	const locker = useRef<Group>(null!)
	const [nameVis, setNameVis] = useState(true)

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
				<Name visible={nameVis} />
				<Locker
					lockerRef={locker}
					enableControls={controls}
					onClick={() => setNameVis(false)}
					onPointerMissed={() => setNameVis(true)}
				/>
				{/* <FogMachine /> */}
				{/* <Floor /> */}
				{!controls && <OrbitControls
					makeDefault
					enableDamping
					enablePan={true}
					// minDistance={16}  // minimum zoom (closer = smaller number)
					// maxDistance={25}
					// minAzimuthAngle={-Math.PI / 6}  // -45°
  					// maxAzimuthAngle={Math.PI / 4}   // +45°
					// minPolarAngle={Math.PI / 4}   // 30°
  					// maxPolarAngle={Math.PI / 2}   // 90°
				/>}
				<Environment
					preset="studio"
					background={false}
					backgroundBlurriness={1}
					environmentRotation={nameVis ? [0, Math.PI / 2, 0] : [0, Math.PI / 3, 0]}
					environmentIntensity={.1}
				/>
				<GizmoHelper
					alignment="bottom-right" // widget alignment within scene
					margin={[0, 0]} // widget margins (X, Y)
				>
				<GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="black" />
				{/* alternative: <GizmoViewcube /> */}
				</GizmoHelper>
				<EffectComposer>
					<Bloom intensity={1.5} luminanceThreshold={1} luminanceSmoothing={0.9} />
				</EffectComposer>
			</Canvas>
		</div>
	);
}

