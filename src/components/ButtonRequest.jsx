import React, { useEffect, useState } from "react"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Typography from "@mui/material/Typography"
import { useSpring, animated } from "@react-spring/web"
import CloseIcon from "@mui/icons-material/Close"
import { supabase } from "../supabaseClient" // pastikan path ini sesuai di project kamu

export default function ButtonRequest() {
	const [open, setOpen] = useState(false)
	const [images, setImages] = useState([])

	const handleOpen = () => setOpen(true)
	const handleClose = () => setOpen(false)

	const fade = useSpring({
		opacity: open ? 1 : 0,
		config: { duration: 200 },
	})

	// Ambil gambar dari Supabase Storage
	const fetchImagesFromSupabase = async () => {
		try {
			// Pastikan bucket kamu bernama "GambarAman"
			const { data, error } = await supabase.storage
				.from("GambarAman")
				.list("", { limit: 100, sortBy: { column: "created_at", order: "asc" } })

			if (error) throw error

			// Ambil URL publik untuk setiap file
			const urls = await Promise.all(
				data.map(async (file) => {
					const { data: publicUrlData } = supabase.storage
						.from("GambarAman")
						.getPublicUrl(file.name)

					return {
						url: publicUrlData.publicUrl,
						timestamp: file.created_at || file.updated_at || new Date().toISOString(),
					}
				})
			)

			setImages(urls)
		} catch (error) {
			console.error("Error fetching images from Supabase Storage:", error)
		}
	}

	useEffect(() => {
		fetchImagesFromSupabase()
	}, [])

	return (
		<div>
			<button
				onClick={handleOpen}
				className="flex items-center space-x-2 text-white px-6 py-4"
				id="SendRequest">
				<img src="/Request.png" alt="Icon" className="w-6 h-6 relative bottom-1 " />
				<span className="text-base lg:text-1xl">Request</span>
			</button>

			<Modal
				aria-labelledby="spring-modal-title"
				aria-describedby="spring-modal-description"
				open={open}
				onClose={handleClose}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{ timeout: 500 }}>
				<animated.div style={fade}>
					<Box className="modal-container relative bg-[#222] rounded-xl p-4 mx-auto w-[90%] max-w-[600px]">
						<CloseIcon
							style={{
								position: "absolute",
								top: "10px",
								right: "10px",
								cursor: "pointer",
								color: "grey",
							}}
							onClick={handleClose}
						/>
						<Typography id="spring-modal-description" sx={{ mt: 2 }}>
							<h6 className="text-center text-white text-2xl mb-5">Request</h6>

							<div className="h-[22rem] overflow-y-scroll overflow-y-scroll-no-thumb">
								{images.length > 0 ? (
									[...images]
										.reverse()
										.map((imageData, index) => (
											<div
												key={index}
												className="flex justify-between items-center px-5 py-2 mt-2"
												id="LayoutIsiButtonRequest">
												<img
													src={imageData.url}
													alt={`Image ${index}`}
													className="h-10 w-10 blur-sm"
												/>
												<span className="ml-2 text-white text-sm">
													{new Date(imageData.timestamp).toLocaleString()}
												</span>
											</div>
										))
								) : (
									<p className="text-center text-gray-400">Belum ada gambar di bucket.</p>
								)}
							</div>

							<div className="text-white text-[0.7rem] mt-5">
								Note: Jika gambar tidak muncul, coba reload halaman.
							</div>
						</Typography>
					</Box>
				</animated.div>
			</Modal>
		</div>
	)
}
