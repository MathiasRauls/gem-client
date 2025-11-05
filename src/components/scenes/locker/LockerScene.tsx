"use client";

import { useControls } from "leva";
import { useRouter } from "next/navigation";
import useDevice, { clamp } from "@/hooks/useDevice";
import { useRef, useEffect, useState, RefObject, Ref, useLayoutEffect, useMemo, useImperativeHandle } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { easing, vector3 } from "maath";
import { a, animated, useSpring } from "@react-spring/three";
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
} from "@react-three/drei";
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
	MathUtils,
	MeshStandardMaterial,
} from "three";

const CONTROLS = false;

function Light() {
	const dirLight1 = useRef<DirectionalLightHelper>(null!);
	const dirLight2 = useRef<DirectionalLightHelper>(null!);
	const dirLight3 = useRef<DirectionalLightHelper>(null!);
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
			<ambientLight intensity={0.25} />
			<directionalLight
				ref={dirLight1}
				castShadow
				color="white"
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
	);
}

const FOGCOLOR = "black";
function FogMachine() {
	const { scene } = useThree();

	useEffect(() => {
		scene.fog = new Fog(FOGCOLOR, 40, 45);
		scene.background = new Color(FOGCOLOR);
	}, [scene]);

	return null;
}

type tNameProps = {
	visible: boolean;
};
function Name({ visible }: tNameProps) {
	const { camera } = useThree();
	const device = useDevice();
	const vanderwolf = useRef<Group>(null!);
	const vanderwolfMesh = useRef<Mesh>(null!);
	const [theta, setTheta] = useState(0);
	const { nodes } = useGLTF("/models/vanderwolf.glb");
	const name = nodes.name as Mesh<BufferGeometry>;

	const NAMECOLOR: string = device?.w < 1160 ? "lime" : "lime";

	// Lights
	const leftLightScale = new Vector3(40, 40, 40);
	const rightLightScale = new Vector3(40, 40, 40);
	const brightness = 0.3;

	const nameLightLeft = useRef<DirectionalLight | null>(null);
	const nameLightLeftHelper = useRef<DirectionalLightHelper | null>(null);

	const nameLightRight = useRef<DirectionalLight | null>(null);
	const nameLightRightHelper = useRef<DirectionalLightHelper | null>(null);

	useFrame(({ clock, camera }, dt, current) => {
		const rad = 0.01;
		const speed = 0.01; // lower = slower
		setTheta((prev) => prev + speed);

		// visible && vanderwolfMesh.current.lookAt(camera.position)
		// vanderwolf.current.rotation.x = 4 * rad * Math.sin(theta)
		vanderwolf.current.rotation.z = 2 * rad * Math.sin(theta);

		!visible
			? easing.damp(vanderwolf.current.position, "y", 20, 0.05, dt)
			: easing.damp(vanderwolf.current.position, "y", 0, 0.05, dt);

		const s = clamp(device.w / 10, 50, 250);
		vanderwolfMesh.current.scale.set(s, s, s);
		vanderwolfMesh.current.position.y = device.w < 1160 ? 32 : 19;
		vanderwolfMesh.current.position.z = device.w < 1160 ? -12.24 : -11;

		const lightPosX = 4;
		const lightPosY = 35;
		const lightPosZ = 17;

		// White
		const l = nameLightLeft.current!;
		l.target.position.set(-13, 10, 0); // where to look
		l.position.set(lightPosX, lightPosY, lightPosZ);

		// Red
		const r = nameLightRight.current!;
		r.target.position.set(0, 10, -13); // where to look
		r.position.set(lightPosX, lightPosY, lightPosZ);
	});

	return (
		<>
			<directionalLight
				// ref={ nameLightLeftHelper }
				ref={(el) => {
					nameLightLeft.current = el;
					nameLightLeftHelper.current = el
						? new DirectionalLightHelper(el, 5, "white")
						: null;
				}}
				castShadow
				color="white"
				intensity={brightness}
				rotateOnAxis={90}
				scale={leftLightScale}
				position={[0, 0, 0]}
			></directionalLight>
			<directionalLight
				// ref={ nameLightLeftHelper }
				ref={(el) => {
					nameLightRight.current = el;
					nameLightRightHelper.current = el
						? new DirectionalLightHelper(el, 5, "red")
						: null;
				}}
				castShadow
				color="white"
				intensity={brightness}
				rotateOnAxis={90}
				scale={rightLightScale}
				position={[0, 0, 0]}
			></directionalLight>
			<group ref={vanderwolf} dispose={null}>
				<mesh
					ref={vanderwolfMesh}
					castShadow
					receiveShadow
					scale={250}
					position={[-13, 19, -11]}
					geometry={name.geometry}
					// rotation={[Math.PI / 1.7,Math.PI / 50,Math.PI / -4]}
					rotation={[0, Math.PI / 3.9, 0]}
				>
					<meshStandardMaterial
						color={NAMECOLOR}
						metalness={1}
						roughness={0.1}
					/>
				</mesh>
			</group>
		</>
	);
}

type InLockerProps = {
	pos: number | Vector3;
};
function InLocker({ pos }: InLockerProps) {
	const elem = useRef<Mesh>(null!);
	const [hover, setHover] = useState(false);

	const [{ twirl }] = useSpring(
		{
			twirl: hover ? -Math.PI : 0,
		},
		[hover]
	);

	useFrame((_, dt) => {
		easing.damp(elem.current.rotation, "y", twirl.get(), 0.05, dt);
	});

	return (
		<mesh
			ref={elem}
			position={pos}
			onPointerOver={(e) => {
				e.stopPropagation();
				setHover(true);
			}}
			onPointerOut={(e) => {
				e.stopPropagation();
				setHover(false);
			}}
		>
			<boxGeometry args={[1.5, 1.5, 1.5]} />
			<meshStandardMaterial color={"green"} />
		</mesh>
	);
}

type PakProps = {
	title: string;
	coverURL: string;
	color: string;
	pos: [number, number, number] | number | Vector3;
	rot: Euler;
};
function GamePak({ title, coverURL, color, pos, rot }: PakProps) {
	const cover = useTexture(`/locker/pak/${coverURL}`);
	cover.flipY = false;
	cover.repeat.set(1.4, 1.75);
	cover.offset.set(-0.21, -0.52);
	const { nodes } = useGLTF("/models/game-pak.glb");
	const pakMesh = nodes.pak as Mesh<BufferGeometry>;
	const pakCoverMesh = nodes.pakCover as Mesh<BufferGeometry>;

	return (
		<group dispose={null}>
			<mesh
				castShadow
				receiveShadow
				position={pos}
				rotation={rot}
				geometry={pakMesh.geometry}
			>
				<mesh castShadow receiveShadow geometry={pakCoverMesh.geometry}>
					<meshStandardMaterial
						map={cover}
						color="#ffffff"
						emissive="#ffffff"
						emissiveMap={cover}
						emissiveIntensity={0.15}
						// metalness={1}
						roughness={1}
					/>
				</mesh>
				<meshStandardMaterial color={color} metalness={0.1} roughness={0.8} />
			</mesh>
		</group>
	);
}

type PakPakProps = {
	paks?: [PakProps, PakProps, PakProps];
	pos: [number, number, number] | number | Vector3;
	pageClick: (page: string) => void;
};
function PakPak({ paks, pos, pageClick }: PakPakProps) {
	const pakGroup = useRef<Group>(null!);
	const [hover, setHover] = useState(false);
	const [click, setClick] = useState(false);
	const clickFlag = useRef(click);
	const AnimatedGamePak = animated(GamePak);

	const testPaks: [PakProps, PakProps, PakProps] = [
		{
			title: "DK",
			coverURL: "dk.jpg",
			color: "chartreuse",
			pos: new Vector3(0.4, 0.1, 0.3),
			rot: new Euler(0, 0, -0.2),
		},
		{
			title: "Zelda",
			coverURL: "zelda.webp",
			color: "dodgerblue",
			pos: new Vector3(0, 0, 0),
			rot: new Euler(0, 0, -0.2),
		},
		{
			title: "Zelda",
			coverURL: "zelda.webp",
			color: "darkviolet",
			pos: new Vector3(-0.4, -0.1, -0.3),
			rot: new Euler(0, 0, -0.2),
		},
	];

	const [{ pakTwirl }] = useSpring(
		{
			pakTwirl: hover ? Math.PI * 2 : 0,
		},
		[hover]
	);

	function aniBob(i: number, child: Group, time: number, delta: number) {
		return child.position.z + (0.1 + i / 90) * Math.sin(10 * time + delta);
	}
	function aniDelay(i: number): number {
		return 0.05 + i * 0.06;
	}
	useFrame(({ clock }, dt, current) => {
		pakGroup.current?.children.forEach((child: any, i: number) => {
			if (child.type === "Group") {
				easing.damp(child.rotation, "x", pakTwirl.get(), aniDelay(i), dt);
				easing.damp(
					child.position,
					"y",
					aniBob(i, child, clock.elapsedTime, dt),
					aniDelay(i),
					dt
				);

				if (clickFlag.current !== click) {
					setClick(false);
					easing.damp(
						child.rotation,
						"x",
						(child.rotation.x += -Math.PI * 2),
						100,
						dt
					);
				}
			}
		});
	});

	function pakPakClick() {
		setClick(true);
		setTimeout(() => pageClick("paks"), 375);
	}

	return (
		<mesh
			ref={pakGroup}
			position={pos}
			onClick={(e) => {
				e.stopPropagation();
				pakPakClick();
			}}
			onPointerOver={(e) => {
				e.stopPropagation();
				setHover(true);
				document.body.style.cursor = "pointer";
			}}
			onPointerOut={(e) => {
				e.stopPropagation();
				setHover(false);
			}}
		>
			{testPaks.map((p, i) => (
				<AnimatedGamePak key={i} {...p} />
			))}
			<boxGeometry args={[1.5, 1.5, 1.5]} />
			<meshBasicMaterial
				color="hotpink" // A color for visual debugging
				transparent
				opacity={0} // Make it completely invisible
			/>
		</mesh>
	);
}

type HeartBombProps = {
	pageClick: (page: string) => void;
};
function HeartBomb({ pageClick }: HeartBombProps) {
	const [hover, setHover] = useState(false);
	const [click, setClick] = useState(false);
	const clickFlag = useRef(click);
	const heartBomb = useRef<Mesh>(null!);
	const heartBombGroup = useRef<Mesh>(null!);
	const pinGroup = useRef<Mesh>(null!);

	const { nodes } = useGLTF("/models/heartbomb.glb");
	const bomb = nodes.bomb as Mesh<BufferGeometry>;
	const base = nodes.base as Mesh<BufferGeometry>;
	const pin = nodes.pin as Mesh<BufferGeometry>;
	const pinShaft = nodes.pinShaft as Mesh<BufferGeometry>;
	const trigger = nodes.trigger as Mesh<BufferGeometry>;
	const hinge = nodes.hinge as Mesh<BufferGeometry>;

	// Materials
	const red = { m: 1, r: 0.4, c: "darkorchid" };
	const skyblue = { m: 1, r: 0.5, c: "darkturquoise" };
	const chrome = { m: 1, r: 0.2, c: "silver" };

	const orgPinPos = useRef(new Vector3());
	const orgPinRot = useRef(new Euler());
	useLayoutEffect(() => {
		if (!pinGroup.current) return;
		orgPinPos.current.copy(pinGroup.current.position);
		orgPinRot.current.copy(pinGroup.current.rotation);
	}, []);

	useFrame(({ clock, camera }, dt, current) => {
		const rad = 0.005;
		const speed = 0.01; // lower = slower

		// if (clickFlag.current !== click) {
		// 	setClick(false)
		// 	heartBombGroup.current.rotation.y += dt * 4
		// }

		if (hover) {
			if (clickFlag.current !== click) {
				setClick(false);
			} else {
				easing.dampAngle(
					heartBombGroup.current.rotation,
					"z",
					MathUtils.degToRad(20),
					0.25,
					dt
				);
				easing.dampAngle(
					heartBombGroup.current.rotation,
					"y",
					MathUtils.degToRad(0),
					0.25,
					dt
				);
				easing.dampAngle(heartBomb.current.position, "x", -0.16, 0.25, dt);

				easing.dampAngle(
					pinGroup.current.rotation,
					"x",
					MathUtils.degToRad(-75),
					0.25,
					dt
				);
				easing.dampAngle(
					pinGroup.current.rotation,
					"y",
					MathUtils.degToRad(10),
					0.25,
					dt
				);
				easing.dampAngle(
					pinGroup.current.rotation,
					"z",
					MathUtils.degToRad(20),
					0.25,
					dt
				);
				easing.dampAngle(pinGroup.current.position, "x", -5, 0.25, dt);
				// easing.dampAngle(pinGroup.current.position, 'y', .05, .25, dt)
				easing.dampAngle(pinGroup.current.position, "z", -5, 0.25, dt);
			}
		} else {
			heartBombGroup.current.rotation.y += dt * 2;

			easing.dampAngle(
				heartBombGroup.current.rotation,
				"z",
				MathUtils.degToRad(0),
				0.25,
				dt
			);
			easing.dampAngle(
				heartBombGroup.current.rotation,
				"x",
				MathUtils.degToRad(0),
				0.25,
				dt
			);
			easing.dampAngle(heartBomb.current.position, "x", 0, 0.25, dt);

			easing.dampAngle(
				pinGroup.current.rotation,
				"x",
				orgPinRot.current.x,
				0.25,
				dt
			);
			easing.dampAngle(
				pinGroup.current.rotation,
				"y",
				orgPinRot.current.y,
				0.25,
				dt
			);
			easing.dampAngle(
				pinGroup.current.rotation,
				"z",
				orgPinRot.current.z,
				0.25,
				dt
			);
			easing.dampAngle(
				pinGroup.current.position,
				"x",
				orgPinPos.current.x,
				0.25,
				dt
			);
			easing.dampAngle(
				pinGroup.current.position,
				"y",
				orgPinPos.current.y,
				0.25,
				dt
			);
			easing.dampAngle(
				pinGroup.current.position,
				"z",
				orgPinPos.current.z,
				0.25,
				dt
			);
		}
	});

	function heartBombClick() {
		setClick(true);
		// setTimeout(() => pageClick('💥'), 375)
	}

	return (
		<mesh
			ref={heartBombGroup}
			dispose={null}
			position={[0, 4.75, 0.5]}
			onClick={(e) => {
				e.stopPropagation();
				heartBombClick();
			}}
			onPointerOver={(e) => {
				e.stopPropagation();
				setHover(true);
				document.body.style.cursor = "pointer";
			}}
			onPointerOut={(e) => {
				e.stopPropagation();
				setHover(false);
				document.body.style.cursor = "default";
			}}
		>
			<mesh
				ref={heartBomb}
				castShadow
				receiveShadow
				geometry={bomb.geometry}
				position={[0, -0.85, 0]}
				scale={[0.568, 0.472, 0.536]}
			>
				<mesh
					castShadow
					receiveShadow
					geometry={base.geometry}
					position={[0, 2.345, 0]}
					scale={[0.327, 0.363, 0.338]}
				>
					<meshStandardMaterial
						metalness={red.m}
						roughness={red.r}
						color={red.c}
					/>
				</mesh>
				<mesh
					castShadow
					receiveShadow
					ref={pinGroup}
					geometry={pin.geometry}
					position={[0.546, 2.765, 0.406]}
					rotation={[-1.885, 0, 0]}
					scale={[0.281, 0.293, 0.31]}
				>
					<mesh
						castShadow
						receiveShadow
						geometry={pinShaft.geometry}
						position={[-0.004, 0.166, 0.939]}
						rotation={[-2.829, -0.387, 0]}
						scale={[0.141, 0.173, 0.141]}
					>
						<meshStandardMaterial
							metalness={chrome.m}
							roughness={chrome.r}
							color={chrome.c}
						/>
					</mesh>
					<meshStandardMaterial
						metalness={chrome.m}
						roughness={chrome.r}
						color={chrome.c}
					/>
				</mesh>
				<mesh
					castShadow
					receiveShadow
					geometry={trigger.geometry}
					position={[0, 1.422, 0]}
					scale={[1.033, 1.146, 1.068]}
				>
					<mesh
						castShadow
						receiveShadow
						geometry={hinge.geometry}
						position={[-0.359, 1.599, 0]}
						rotation={[Math.PI / 2, 0, 0]}
						scale={0.358}
					>
						<meshStandardMaterial
							metalness={chrome.m}
							roughness={chrome.r}
							color={chrome.c}
						/>
					</mesh>
					<meshStandardMaterial
						metalness={skyblue.m}
						roughness={skyblue.r}
						color={skyblue.c}
					/>
				</mesh>
				<meshStandardMaterial
					metalness={red.m}
					roughness={red.r}
					color={red.c}
				/>
			</mesh>
			<boxGeometry args={[1.5, 1.5, 1.5]} />
			<meshBasicMaterial
				color="hotpink" // A color for visual debugging
				transparent
				opacity={0} // Make it completely invisible
			/>
		</mesh>
	);
}

function Canti() {
	const canti = useRef<Mesh>(null!);
	const isPointerInCanvas = useRef(false);

	const githubLogo = useTexture(`/locker/github.png`);
	githubLogo.flipY = false;
	githubLogo.repeat.set(1.4, 1.75);
	githubLogo.offset.set(-0.21, -0.52);

	const { nodes } = useGLTF("/models/canti.glb");
	const helmet = nodes.canti as Mesh<BufferGeometry>;
	const backCover = nodes.backCover as Mesh<BufferGeometry>;
	const backPlate = nodes.backPlate as Mesh<BufferGeometry>;
	const backPlateBolts = nodes.backPlateBolts as Mesh<BufferGeometry>;
	const backRack = nodes.backRack as Mesh<BufferGeometry>;
	const faceBolts = nodes.faceBolts as Mesh<BufferGeometry>;
	const faceFrame = nodes.faceFrame as Mesh<BufferGeometry>;
	const gear = nodes.gear as Mesh<BufferGeometry>;
	const gearCap = nodes.gearCap as Mesh<BufferGeometry>;
	const helmetRing = nodes.helmetRing as Mesh<BufferGeometry>;
	const mouth = nodes.mouth as Mesh<BufferGeometry>;
	const btm = nodes.btm as Mesh<BufferGeometry>;
	const center = nodes.center as Mesh<BufferGeometry>;
	const top = nodes.top as Mesh<BufferGeometry>;
	const mouthLower = nodes.mouthLower as Mesh<BufferGeometry>;
	const pistons = nodes.pistons as Mesh<BufferGeometry>;
	const pistonCaps = nodes.pistonCaps as Mesh<BufferGeometry>;
	const screen = nodes.screen as Mesh<BufferGeometry>;
	const wires = nodes.wires as Mesh<BufferGeometry>;

	const whtMat = useMemo(() => new MeshStandardMaterial({
		color: 'lightgrey',
		roughness: .95,
		metalness: .5
	}), [])
	const screenMat = useMemo(() => new MeshStandardMaterial({
		color: 'wheat',
		roughness: .75,
		metalness: .5,
		emissive: '#FF0000',
		emissiveIntensity: 5,
		emissiveMap: githubLogo
	}), [])
	const silverMat = useMemo(() => new MeshStandardMaterial({
		color: 'silver',
		roughness: .4,
		metalness: .9
	}), [])
	const gunMat = useMemo(() => new MeshStandardMaterial({
		color: '#90594e',
		roughness: .45,
		metalness: 1
	}), [])
	const rackMat = useMemo(() => new MeshStandardMaterial({
		color: '#795b55',
		roughness: .45,
		metalness: 1
	}), [])
	const skyMat = useMemo(() => new MeshStandardMaterial({
		color: 'skyblue',
		roughness: .45,
		metalness: 1
	}), [])
	const atmoskMat = useMemo(() => new MeshStandardMaterial({
		color: 'red',
		roughness: .2,
		metalness: 1
	}), [])

	useFrame(({ gl, pointer }) => {
		if (canti.current && isPointerInCanvas.current) {
			// Define rotation limits (in radians)
			const maxRotationX = Math.PI / 8
			const maxRotationY = Math.PI / 6

			// Map pointer position (-1 to 1) to rotation within limits
			const targetRotationY = pointer.x * maxRotationY
			const targetRotationX = -pointer.y * maxRotationX  // Negative for natural movement

			// Smooth interpolation (lerp) for natural movement
			canti.current.rotation.y += (targetRotationY - canti.current.rotation.y) * 0.1;
			canti.current.rotation.x += (targetRotationX - canti.current.rotation.x) * 0.1;
		} else if (!isPointerInCanvas.current) {
			canti.current.rotation.y *= 0.9
			canti.current.rotation.x *= 0.9
		}
	});

	useEffect(() => {
		const canvas = document.querySelector('canvas');
		if (!canvas) return;

		const handleEnter = () => { isPointerInCanvas.current = true; };
		const handleLeave = () => { isPointerInCanvas.current = false; };

		handleEnter()
		canvas.addEventListener('pointerenter', handleEnter);
		canvas.addEventListener('pointerleave', handleLeave);

		return () => {
			canvas.removeEventListener('pointerenter', handleEnter);
			canvas.removeEventListener('pointerleave', handleLeave);
		};
	}, []);

	return (
		<group
			ref={canti}
			dispose={null}
			scale={.7}
			position={[0, 2.5, 1]}
			onPointerOver={(e) => {
				document.body.style.cursor = "pointer";
			}}
		>
			<mesh
				castShadow
				receiveShadow
				geometry={helmet.geometry}
				material={atmoskMat}
				position={[0, 1.453, -0.562]}
			>
				<mesh
					castShadow
					receiveShadow
					geometry={backCover.geometry}
					material={gunMat}
					position={[-0.003, -0.824, -0.998]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={backPlate.geometry}
					material={rackMat}
					position={[-0.003, -0.824, -0.998]}
					rotation={[Math.PI / 2, 0, 0]}
					scale={0.51}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={backPlateBolts.geometry}
					material={silverMat}
					position={[-0.003, -0.824, -0.998]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={backRack.geometry}
					material={rackMat}
					position={[-0.001, -0.937, -0.889]}
					rotation={[Math.PI / 2, 0, 0]}
					scale={[0.647, 0.747, 0.536]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={faceBolts.geometry}
					material={silverMat}
					position={[0, -0.799, 0.714]}
					scale={[1, 0.948, 1.079]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={faceFrame.geometry}
					material={atmoskMat}
					position={[0, -1.429, 0.566]}
					scale={[1, 0.948, 1.079]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={gear.geometry}
					material={gunMat}
					position={[-0.003, -0.837, -1.354]}
					rotation={[-Math.PI / 2, 0, 0]}
					scale={[0.346, 0.357, 0.346]}
				>
					<mesh
						castShadow
						receiveShadow
						geometry={gearCap.geometry}
						material={atmoskMat}
					/>
				</mesh>
				<mesh
					castShadow
					receiveShadow
					geometry={helmetRing.geometry}
					material={gunMat}
					scale={[1, 0.948, 1.079]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={mouth.geometry}
					material={whtMat}
					position={[0, -1.419, 0.564]}
					rotation={[-0.08, 0, 0]}
					scale={[1.059, 1.102, 1.142]}
				>
					<mesh
						castShadow
						receiveShadow
						geometry={btm.geometry}
						material={whtMat}
					/>
					<mesh
						castShadow
						receiveShadow
						geometry={center.geometry}
						material={whtMat}
					/>
					<mesh
						castShadow
						receiveShadow
						geometry={top.geometry}
						material={whtMat}
					/>
				</mesh>
				<mesh
					castShadow
					receiveShadow
					geometry={mouthLower.geometry}
					material={rackMat}
					position={[0, -1.429, 0.513]}
					scale={[1, 0.948, 0.759]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={pistons.geometry}
					material={atmoskMat}
					position={[0, -0.789, 0.699]}
					scale={[0.095, 0.203, 0.095]}
				>
					<mesh
						castShadow
						receiveShadow
						geometry={pistonCaps.geometry}
						material={silverMat}
					/>
				</mesh>
				<mesh
					castShadow
					receiveShadow
					geometry={screen.geometry}
					material={screenMat}
					position={[0, -0.799, 0.714]}
					scale={[1, 0.948, 1.079]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={wires.geometry}
					material={skyMat}
					position={[-0.003, -0.824, -0.998]}
					scale={0.198}
				/>
			</mesh>
		</group>
	);
}

function Shuriken() {
	const { nodes } = useGLTF("/models/shuriken.glb");
	const shuriken = nodes.shuriken as Mesh<BufferGeometry>;
	const ring = nodes.ring as Mesh<BufferGeometry>;

	const color = "silver";
	const rough = 0.2;
	const metal = 1;

	return (
		<group dispose={null}>
			<mesh
				castShadow
				receiveShadow
				position={[2, 2, 2]}
				scale={1}
				geometry={shuriken.geometry}
			>
				<mesh castShadow receiveShadow geometry={ring.geometry}>
					<meshStandardMaterial
						metalness={metal}
						roughness={rough}
						color={color}
					/>
				</mesh>
				<meshStandardMaterial
					metalness={metal}
					roughness={rough}
					color={color}
				/>
			</mesh>
		</group>
	);
}

type LockerProps = {
	onClick: () => void;
	onPointerMissed: () => void;
	enableControls: boolean;
	lockerRef: RefObject<Group | null>;
};
function Locker({
	lockerRef,
	enableControls,
	onPointerMissed,
	onClick,
}: LockerProps) {
	const router = useRouter();
	const rig = useRef<CamRigHandle>(null);
	const locker = useRef<Mesh>(null!);
	const lockerDoor = useRef<Mesh>(null!);
	const glow = useRef<Mesh>(null!);
	const prevCamPos = useRef<Vector3>(new Vector3());
	const [camTargetPos, setCamTargetPos] = useState<Vector3>(new Vector3());
	const [theta, setTheta] = useState(0);
	const [clicked, setClicked] = useState(false);
	const closedFlag = useRef(clicked);
	const openFlag = useRef(!clicked);

	const { nodes } = useGLTF("/models/locker-v1.glb");
	const lockerMesh = nodes.locker as Mesh<BufferGeometry>;
	const lockerDoorMesh = nodes["locker-door"] as Mesh<BufferGeometry>;
	const lockerHandleMesh = nodes["right-handle"] as Mesh<BufferGeometry>;

	// Light
	const lockerLight = useRef<DirectionalLight>(null!);
	const lockerLightHelper = useRef<DirectionalLightHelper>(null!);
	useHelper(lockerLightHelper, DirectionalLightHelper, 5, "yellow");

	const pageClick = (page: string) => {
		router.push(`/${page}/`);
	};

	// const lockerShader = new ShaderMaterial({ vertexShader, fragmentShader })
	// console.log(nodes.locker.geometry.attributes)

	// Locker Settings
	const LOCKER_ROUGHNESS: number = 0.25;
	const LOCKERCOLOR: string = "lightslategrey";

	// Locker Content Positions
	const LOCKER_TOP = new Vector3(0, 6.5, 0.5);
	const LOCKER_MID = new Vector3(0, 4.8, 0.5);
	const LOCKER_BTM = new Vector3(0, 3, 0.5);

	const [{ rotX, rotY, posZ, scaleZ, light }] = useSpring(
		{
			rotX: clicked ? -Math.PI / -55 : 0,
			rotY: clicked ? -Math.PI / 1.6 : 0,
			scaleZ: clicked ? 0 : 1,
			light: clicked ? 0 : 10,
			posZ: clicked ? 10 : 0,
			config: { tension: 200, friction: 14 },
		},
		[clicked]
	);

	useFrame(({ clock, camera }, dt, current) => {
		// camera.lookAt(locker.current.position.clone().add(new Vector3(0,4,0)))
		const rad = 0.005;
		const speed = 0.01; // lower = slower
		setTheta((prev) => prev + speed);

		locker.current.rotation.x = 2 * rad * Math.sin(theta);
		locker.current.rotation.z = 5 * rad * Math.sin(theta);
		locker.current.rotation.y = (rad / 2) * Math.cos(theta);
		locker.current.position.y += rad * Math.sin(theta);

		glow.current.rotation.x = 2 * rad * Math.sin(theta);
		glow.current.rotation.z = 5 * rad * Math.sin(theta);
		glow.current.rotation.y = (rad / 2) * Math.cos(theta);
		glow.current.position.y += rad * Math.sin(theta);

		// Glow
		const glowZ = clicked ? 0 : 0;
		const glowZScale = clicked ? 0 : 1;
		const glowYScale = clicked ? 0 : 1;
		const glowEmission = clicked ? 0 : 10;
		easing.damp(glow.current.scale, "y", glowYScale, 0.05, dt);
		easing.damp(glow.current.scale, "z", glowZScale, 0.05, dt);
		easing.damp(glow.current.position, "z", glowZ, 0.05, dt);
		easing.damp(glow.current.material, "emissiveIntensity", glowEmission, 5, dt);

		// Locker Door
		easing.damp(lockerDoor.current.rotation, "y", rotY.get(), 0.65, dt);
		easing.damp(lockerDoor.current.rotation, "x", rotX.get(), 0.65, dt);

		// Camera
		prevCamPos.current.copy(camera.position);
		setCamTargetPos(clicked ? new Vector3(3, 12, 9) : new Vector3(15, 2, 15))
		const camTargetPos = clicked
			? new Vector3(3, 12, 9)
			: new Vector3(15, 2, 15)
		if (closedFlag.current !== clicked) {
			camera.lookAt(
				locker.current.position.clone().add(new Vector3(-1, 4.1, 0))
			);
			enableControls && camera.position.lerp(camTargetPos, 0.08);
		}
		if (openFlag.current !== clicked) {
			enableControls && camera.position.lerp(camTargetPos, 0.04);
			camera.lookAt(
				locker.current.position.clone().add(new Vector3(0, 4.1, 0))
			);
		}

		// lockerLight.current.lookAt(locker.current.position)
		// lockerLightHelper.current.lookAt(locker.current.position)
	});

	return (
		<>
			<CamRig rigRef={rig} target={camTargetPos} />
			<group
				ref={lockerRef}
				onClick={onClick}
				onPointerMissed={onPointerMissed}
				rotation={[0.01, 0, -0.01]}
			>
				<group
					ref={locker}
					castShadow
					onClick={() => setClicked(true)}
					onPointerMissed={() => setClicked(false)}
					onPointerOver={(e) => {
						e.stopPropagation();
						document.body.style.cursor = "pointer";
					}}
					onPointerOut={(e) => {
						e.stopPropagation();
						document.body.style.cursor = "default";
					}}
					dispose={null}
					receiveShadow
					scale={[1, 1, 1]}
					rotation={[0, 0, 0]}
					position={[0, 6, 0]}
				>
					{/* <directionalLight
						ref={(el) => {
							lockerLight.current = el;
							lockerLightHelper.current = el;
						}}
						castShadow
						color='white'
						intensity={2}
						scale={[1,4,1]}
						position={[0, 6, 4]}
						// rotateOnAxis={90}
						// shadow-normalBias={0.02}
						// shadow-mapSize={[1024, 1024]}
					>
					</directionalLight> */}
					<mesh
						castShadow
						receiveShadow
						geometry={lockerMesh.geometry}
						position={[-0.005, 4.341, -0.223]}
					>
						<meshStandardMaterial
							metalness={1}
							roughness={LOCKER_ROUGHNESS}
							color={LOCKERCOLOR}
						/>
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
							<meshStandardMaterial
								metalness={1}
								roughness={LOCKER_ROUGHNESS}
								color="gold"
							/>
						</mesh>
						<meshStandardMaterial
							metalness={1}
							roughness={LOCKER_ROUGHNESS}
							color={LOCKERCOLOR}
						/>
					</a.mesh>
					{clicked && (
						<>
							<PakPak pos={LOCKER_TOP} pageClick={pageClick} />
							<HeartBomb pageClick={pageClick} />
							{/* <InLocker pos={LOCKER_TOP} /> */}
							{/* <InLocker pos={LOCKER_MID} /> */}
							{/* <InLocker pos={LOCKER_BTM} /> */}
							<Canti />
						</>
					)}
				</group>
				<a.mesh ref={glow} position={[0, 10.8, 0]}>
					<boxGeometry args={[3.3, 6, 2]} />
					<meshStandardMaterial emissive="#00FF00" emissiveIntensity={10} />
				</a.mesh>
			</group>
		</>
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

type CamRigHandle = {
	setCamTarget: (x: number, y: number, z: number) => void;
	getCamTarget: () => Vector3;
}
type CamRigProps = {
	rigRef: Ref<CamRigHandle>;
	target: Vector3;
}
function CamRig({ rigRef, target }: CamRigProps) {
	const targetPos = useRef(target)
	const vec = useRef(new Vector3())

	useImperativeHandle(rigRef, () => ({
		setCamTarget: (x: number, y: number, z: number) => { targetPos.current.set(target.x, target.y, target.z) },
		getCamTarget: () => targetPos.current.clone()
	}))

	useFrame(({ camera, pointer }) => {
		const offsetX = pointer.x * 2
		const offsetY = pointer.y * 2

		vec.current.set(
			target.x + offsetX,
			target.y + offsetY,
			target.z
		)

		camera.position.lerp(vec.current, 0.05)
		camera.lookAt(targetPos.current)
	})

	return null
}

export default function LockerScene() {
	const { controls } = useControls({
		controls: { value: true },
	});
	const locker = useRef<Group>(null!);
	const [nameVis, setNameVis] = useState(true);

	return (
		<div className="h-screen w-screen">
			<Canvas
				camera={{ position: [20, 0, 20], fov: 50 }}
				// fog={{ color: '#aaaaaa', near: 5, far: 20 }}
				gl={{ antialias: true }}
				onCreated={({ gl }) => {
					gl.setClearColor("black", 1);
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
				{!controls && (
					<OrbitControls
						makeDefault
						enableDamping
						enablePan={true}
						// minDistance={16}  // minimum zoom (closer = smaller number)
						// maxDistance={25}
						// minAzimuthAngle={-Math.PI / 6}  // -45°
						// maxAzimuthAngle={Math.PI / 4}   // +45°
						// minPolarAngle={Math.PI / 4}   // 30°
						// maxPolarAngle={Math.PI / 2}   // 90°
					/>
				)}
				<Environment
					preset="studio"
					background={false}
					backgroundBlurriness={1}
					environmentRotation={
						nameVis ? [0, Math.PI / 2, 0] : [1, Math.PI / 86, -13]
					}
					environmentIntensity={nameVis ? 0.1 : 0.35}
				/>
				<GizmoHelper
					alignment="bottom-right" // widget alignment within scene
					margin={[0, 0]} // widget margins (X, Y)
				>
					<GizmoViewport
						axisColors={["red", "green", "blue"]}
						labelColor="black"
					/>
					{/* alternative: <GizmoViewcube /> */}
				</GizmoHelper>
				<EffectComposer>
					<Bloom
						intensity={1.5}
						luminanceThreshold={1}
						luminanceSmoothing={0.9}
					/>
				</EffectComposer>
			</Canvas>
		</div>
	);
}
