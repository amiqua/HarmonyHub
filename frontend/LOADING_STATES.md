# Loading States Pattern

## Standard Loading State Pattern

All async operations should follow this pattern:

```jsx
export function SongList() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await http.get("/songs");
        setSongs(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load songs");
        toast.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (isLoading) return <SongsListSkeleton />;
  if (error) return <ErrorAlert message={error} />;
  if (songs.length === 0) return <EmptyState />;

  return <SongsList songs={songs} />;
}
```

## Skeleton Components

Create skeleton placeholders for loading states:

```jsx
export function SongsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}
```

## React Query Pattern (Recommended)

For better loading state management:

```jsx
import { useQuery } from "@tanstack/react-query";

function SongList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const res = await http.get("/songs");
      return res.data?.data;
    },
  });

  if (isLoading) return <SongsListSkeleton />;
  if (error) return <ErrorAlert message={error.message} />;

  return <SongsList songs={data} />;
}
```

## Best Practices

1. **Always show loading state** - Use skeleton or spinner
2. **Handle errors gracefully** - Show user-friendly messages
3. **Show empty states** - Distinguish between loading and no data
4. **Use Toast for temporary feedback** - Use `toast.error()`, `toast.success()`
5. **Disable interactions during loading** - Prevent double-clicks
6. **Set appropriate timeouts** - Long operations need visual feedback

## Components

- `<Skeleton />` - Generic skeleton loader
- `<SongsListSkeleton />` - For song lists
- `<PlayerSkeleton />` - For player
- `<ErrorAlert />` - Error display
- `<EmptyState />` - No data placeholder
