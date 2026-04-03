import { useState } from "react";
import { Search, SlidersHorizontal, Home, Users, Award, TrendingUp, ArrowRight, Shield } from "lucide-react";
import LotteryCard, { Lottery } from "../components/LotteryCard";
import Navbar from "../components/Navbar";
import { lotteries } from "../data/lotteries";

const STATS = [
	{
		icon: Home,
		label: "Tenements Available",
		value: "12,000+",
		color: "text-blue-600",
		bg: "bg-blue-50",
	},
	{
		icon: Users,
		label: "Registered Applicants",
		value: "8.5L+",
		color: "text-purple-600",
		bg: "bg-purple-50",
	},
	{
		icon: Award,
		label: "Lotteries Conducted",
		value: "340+",
		color: "text-orange-600",
		bg: "bg-orange-50",
	},
	{
		icon: TrendingUp,
		label: "Allotments Done",
		value: "95K+",
		color: "text-green-600",
		bg: "bg-green-50",
	},
];

const HOW_IT_WORKS = [
	{
		step: "01",
		title: "Browse Lotteries",
		desc: "Find active lotteries matching your income group and preferred location across Maharashtra.",
	},
	{
		step: "02",
		title: "Register & Apply",
		desc: "Create your account, fill the application form and pay the application fee online.",
	},
	{
		step: "03",
		title: "Attend Lottery",
		desc: "Wait for the transparent computerized lucky draw on the scheduled lottery date.",
	},
	{
		step: "04",
		title: "Get Your Home",
		desc: "If selected, complete the documentation and payment to get possession of your new home.",
	},
];

type LandingPageProps = {
	onSelectLottery: (lottery: Lottery) => void;
};

export default function LandingPage({ onSelectLottery }: LandingPageProps): JSX.Element {
	const [search, setSearch] = useState<string>("");
	const [activeFilter, setActiveFilter] = useState<string>("All");

	const typedLotteries = lotteries as unknown as Lottery[];

	const boards: string[] = [
		"All",
		...Array.from(
			new Set(typedLotteries.map((l) => l.boardModel?.boardName).filter((v): v is string => Boolean(v)))
		),
	];

	const filtered: Lottery[] = typedLotteries.filter((l) => {
		const boardName = l.boardModel?.boardName ?? "";
		const matchesSearch =
			l.lotteryName.toLowerCase().includes(search.toLowerCase()) ||
			l.lotteryCode.toLowerCase().includes(search.toLowerCase()) ||
			boardName.toLowerCase().includes(search.toLowerCase());

		const matchesFilter = activeFilter === "All" || boardName === activeFilter;
		return matchesSearch && matchesFilter;
	});

	const openCount = typedLotteries.filter(
		(l) => l.applicationStartDateStatus === "SUCCESS" && l.applicationEndDateStatus === "PENDING"
	).length;

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />

			{/* Hero */}
			<section className="relative bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 overflow-hidden">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyLTZ2Nmg2di02aC02em0xMiAwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
				<div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
					<div className="max-w-3xl">
						<div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full border border-orange-500/30 mb-6">
							<span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
							{openCount}{" "}
							{openCount === 1 ? "Lottery" : "Lotteries"} Open for
							Applications
						</div>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
							Your Dream Home <br />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
								Awaits in Maharashtra
							</span>
						</h1>
						<p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
							MHADA provides affordable housing for economically weaker
							sections across Maharashtra through transparent lottery-based
							allotment.
						</p>

						{/* Search bar */}
						<div className="flex gap-2 max-w-2xl">
							<div className="relative flex-1">
								<Search
									size={18}
									className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
								/>
								<input
									type="text"
									placeholder="Search lotteries by name, code, or board…"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
								/>
							</div>
							<button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center gap-2 whitespace-nowrap">
								<Search size={16} />
								Search
							</button>
						</div>

						{/* Quick filters */}
						<div className="flex gap-2 mt-4 flex-wrap">
							{boards.map((board) => (
								<button
									key={board}
									onClick={() => setActiveFilter(board)}
									className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
										activeFilter === board
											? "bg-orange-500 text-white shadow"
											: "bg-white/10 text-gray-300 hover:bg-white/20"
									}`}
								>
									{board}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Wave divider */}
				<div className="absolute bottom-0 left-0 right-0">
					<svg
						viewBox="0 0 1440 60"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="w-full"
					>
						<path
							d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
							fill="#F9FAFB"
						/>
					</svg>
				</div>
			</section>

			{/* Stats */}
			<section className="max-w-7xl mx-auto px-4 -mt-1 pb-8">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{STATS.map(
						({ icon: Icon, label, value, color, bg }) => (
							<div
								key={label}
								className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
							>
								<div
									className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}
								>
									<Icon size={22} className={color} />
								</div>
								<div>
									<p className="text-xl font-bold text-gray-900">
										{value}
									</p>
									<p className="text-xs text-gray-500 leading-tight">
										{label}
									</p>
								</div>
							</div>
						)
					)}
				</div>
			</section>

			{/* Lotteries section */}
			<section className="max-w-7xl mx-auto px-4 py-6">
				<div className="flex items-end justify-between mb-6">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							Active Lotteries
						</h2>
						<p className="text-gray-500 text-sm mt-1">
							{filtered.length}{" "}
							{filtered.length === 1 ? "lottery" : "lotteries"} found
							{activeFilter !== "All" ? ` in ${activeFilter}` : ""}
						</p>
					</div>
					<button className="hidden md:flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
						<SlidersHorizontal size={14} />
						Filters
					</button>
				</div>

				{filtered.length === 0 ? (
					<div className="text-center py-20 text-gray-400">
						<Home
							size={48}
							className="mx-auto mb-3 opacity-30"
						/>
						<p className="text-lg font-medium">No lotteries found</p>
						<p className="text-sm mt-1">
							Try adjusting your search or filters
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
						{filtered.map((lottery) => (
							<LotteryCard
								key={lottery.key}
								lottery={lottery}
								onSelect={onSelectLottery}
							/>
						))}
					</div>
				)}
			</section>

			{/* How it works */}
			<section className="bg-white border-t border-gray-100 mt-10 py-16">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-10">
						<h2 className="text-2xl font-bold text-gray-900">
							How It Works
						</h2>
						<p className="text-gray-500 mt-2 text-sm">
							Simple steps to apply for affordable housing
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{HOW_IT_WORKS.map(
							({ step, title, desc }, i) => (
								<div key={step} className="relative">
									{ i < HOW_IT_WORKS.length - 1 && (
										<div className="hidden lg:block absolute top-6 left-full w-full h-px bg-orange-100 -translate-x-1/2 z-0" />
									)}
									<div className="relative bg-gray-50 rounded-2xl p-6 hover:bg-orange-50 transition-colors border border-gray-100">
										<div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold text-lg rounded-xl flex items-center justify-center mb-4 shadow-sm">
											{step}
										</div>
										<h3 className="font-semibold text-gray-900 mb-2">
											{title}
										</h3>
										<p className="text-sm text-gray-500 leading-relaxed">
											{desc}
										</p>
									</div>
								</div>
							)
						)}
					</div>
				</div>
			</section>

			{/* Trust banner */}
			<section className="bg-gradient-to-r from-orange-600 to-red-700 py-12">
				<div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="text-white text-center md:text-left">
						<h2 className="text-2xl font-bold mb-1">
							Ready to Find Your Home?
						</h2>
						<p className="text-orange-100 text-sm">
							Register today and apply to available lotteries in your area.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<button className="bg-white text-orange-700 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2 justify-center">
							Register Now{" "}
							<ArrowRight size={16} />
						</button>
						<button className="bg-orange-700/50 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700/70 transition-all border border-orange-400/40">
							Learn More
						</button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-slate-900 text-gray-400 py-10">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
						<div className="col-span-2 md:col-span-1">
							<div className="flex items-center gap-2 mb-3">
								<div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
									<Home size={16} className="text-white" />
								</div>
								<span className="text-white font-bold">MHADA</span>
							</div>
							<p className="text-sm leading-relaxed">
								Maharashtra Housing and Area Development Authority —
								making affordable housing accessible to all.
							</p>
						</div>
						{[
							{
								title: "Quick Links",
								links: [
									"Active Lotteries",
									"My Applications",
									"Allotment Status",
									"RERA Info",
								],
							},
							{
								title: "Support",
								links: [
									"Help Center",
									"Contact Us",
									"Grievance",
									"RTI",
								],
							},
							{
								title: "Legal",
								links: [
									"Privacy Policy",
									"Terms of Use",
									"Disclaimer",
									"Accessibility",
								],
							},
						].map(({ title, links }) => (
							<div key={title}>
								<h4 className="text-white font-semibold text-sm mb-3">
									{title}
								</h4>
								<ul className="space-y-2">
									{links.map((link) => (
										<li key={link}>
											<a
												href="#"
												className="text-sm hover:text-orange-400 transition-colors"
											>
												{link}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="border-t border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
						<p>
							© 2026 MHADA — Government of Maharashtra. All rights reserved.
						</p>
						<div className="flex items-center gap-1 text-green-400">
							<Shield size={12} />
							<span>Secure Government Portal</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
