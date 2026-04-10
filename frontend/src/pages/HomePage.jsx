import HomeHeroCarousel from "@/components/home/HomeHeroCarousel";
import HomeZingChartSection from "@/components/home/HomeZingChartSection";
import HomeSuggestedPlaylists from "@/components/home/HomeSuggestedPlaylists";
import HomeSuggestedSongsTable from "@/components/home/HomeSuggestedSongsTable";
import HomeNewReleasesGrid from "@/components/home/HomeNewReleasesGrid";

export default function HomePage({ onLogin, onPlaySong, onGoZingChart }) {
  return (
    <div className="home-page">
      <HomeHeroCarousel onLoginClick={onLogin} />

      <HomeZingChartSection
        onPlayAll={() => console.log("[HomePage] Play all zingchart")}
        onPlaySong={(song) => onPlaySong?.(song)}
        onMoreClick={() => onGoZingChart?.()}
      />

      <HomeSuggestedPlaylists onPlay={(song) => onPlaySong?.(song)} />

      <HomeSuggestedSongsTable
        limit={10}
        sort="newest"
        onPlaySong={(song) => onPlaySong?.(song)}
        onSelectSong={(song) => console.log("[HomePage] Select song:", song)}
      />
    </div>
  );
}
