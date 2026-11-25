import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, View } from 'react-native';

import { BedIcon, ChevronIcon } from '@/components/Icons';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, ExampleTag, Screen, SectionHeader } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { sampleWouldReturn } from '@/lib/friendTrips';
import { placeDetails } from '@/lib/placeDetails';
import { parseStaySub, sampleCountry } from '@/lib/placeFeatures';
import { getPlace } from '@/lib/sample';
import { personHref } from '@/lib/samplePeople';
import { useTaste } from '@/lib/taste';
import NotFound from '../+not-found';

/**
 * One hotel, villa or Airbnb (owner, Nov 2026): what it's like, the typical price a night, your score and the friend who
 * stayed, then links out to see prices and book on the hotel's own site, Booking.com
 * or Airbnb. The app never takes bookings or asks for dates (product rule 6): it hands you over to the site.
 */
export default function StayPage() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name: string }>();
  const taste = useTaste();
  const place = getPlace(slug);
  const stay = placeDetails[slug]?.stays.find((s) => s.name === name);
  if (!place || !stay) return <NotFound />;

  const country = sampleCountry(slug);
  const { priceFrom, friend } = parseStaySub(stay.sub);
  // The words after the price, unless they just say who stayed ("from £280 a night · Sophie stayed").
  const about = stay.sub?.split(' · ').slice(1).join(' · ') || null;
  const description = about && !/ stayed$/.test(about) ? about : null;
  const yours = taste.forItem({ slug, kind: 'Stay', name: stay.name, friends: '' });
  const friendScore = friend ? stay.score : null;
  const wouldReturn = friendScore != null ? sampleWouldReturn(friendScore) : null;

  // Links out. Search links, so they always land on the right hotel without us storing addresses.
  const isHome = /airbnb|apartment/i.test(stay.type);
  const where = `${stay.name}, ${place.name}`;
  const bookingUrl = `https://www.booking.com/searchresults.en-gb.html?ss=${encodeURIComponent(where)}`;
  const airbnbUrl = `https://www.airbnb.co.uk/s/${encodeURIComponent(`${place.name}, ${country}`)}/homes`;
  const siteUrl = `https://www.google.com/search?q=${encodeURIComponent(`${stay.name} ${place.name} official website`)}`;
  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <Screen>
      {/* Header: no photo until friends add their own, so a soft band with the stay's name. */}
      <View style={{ backgroundColor: colors.sageSoft, paddingHorizontal: GUTTER, paddingTop: 14, paddingBottom: 26, gap: 14 }}>
        <BackButton />
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
              <BedIcon color={colors.olive} size={18} />
            </View>
            <Text variant="label">{stay.type}</Text>
          </View>
          <Text variant="title" accessibilityRole="header" style={{ fontSize: 34, lineHeight: 40 }}>
            {stay.name}
          </Text>
          <Pressable onPress={() => router.push(`/place/${slug}`)} accessibilityRole="link" accessibilityLabel={`In ${place.name}, ${place.region}. Open ${place.name}`} hitSlop={6}>
            <Text variant="body" style={{ color: colors.accentText }}>
              {place.name}, {place.region} →
            </Text>
          </Pressable>
        </View>
      </View>

      <Card tone="cream" style={{ marginHorizontal: GUTTER, marginTop: -14, padding: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ScoreStamp score={yours.score} size="md" label="Your score" />
          <View style={{ flex: 1 }}>
            <Text variant="subheading">Your score</Text>
            <Text variant="small">{yours.note}</Text>
          </View>
        </View>
      </Card>

      {/* The facts: price, who stayed, what it's like. */}
      <View style={{ paddingHorizontal: GUTTER, marginTop: 22, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Fact label="Price per night" value={priceFrom != null ? `From about £${priceFrom}` : 'Varies'} />
          <Fact label="Type" value={stay.type} />
        </View>
        {!!description && <Text variant="quote">{description}</Text>}
        {!!friend && (
          <Pressable
            disabled={!personHref(friend)}
            onPress={() => router.push(personHref(friend) as never)}
            accessibilityRole="link"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12 }}
          >
            {friendScore != null && <ScoreStamp score={friendScore} size="sm" label={`${friend}'s score`} />}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="strong">{friend} stayed here</Text>
                <ExampleTag />
              </View>
              <Text variant="small">
                {[friendScore != null ? `Gave it ${friendScore.toFixed(1)}` : null, wouldReturn === true ? 'Would stay again' : wouldReturn === false ? "Wouldn't stay again" : null].filter(Boolean).join(' · ') || 'See their profile'}
              </Text>
            </View>
            <ChevronIcon color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Prices and booking happen on their site. */}
      <View style={{ marginTop: 30 }}>
        <SectionHeader>See prices</SectionHeader>
      </View>
      <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
        {isHome ? (
          <Button title={`See homes in ${place.name} on Airbnb`} kind="accent" onPress={() => open(airbnbUrl)} accessibilityLabel={`See homes in ${place.name} on Airbnb. Opens the Airbnb website`} />
        ) : (
          <Button title="See prices on Booking.com" kind="accent" onPress={() => open(bookingUrl)} accessibilityLabel={`See prices for ${stay.name} on Booking.com. Opens the Booking.com website`} />
        )}
        <Button title="Find their own website" kind="outline" onPress={() => open(siteUrl)} accessibilityLabel={`Find ${stay.name}'s own website. Opens a web search`} />
        <Text variant="tiny" style={{ textAlign: 'center' }}>
          Our prices are a rough guide. The real price for your dates, and booking, are on their site.
        </Text>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 30, marginBottom: 20 }}>
        <Button
          title="Save to a board"
          kind="outline"
          onPress={() => router.push({ pathname: '/save', params: { place: stay.name, country, slug, kind: 'stay', parent: place.name, parentSlug: slug } })}
        />
      </View>
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text variant="label">{label}</Text>
      <Text variant="body" style={{ fontFamily: fonts.sansSemiBold }}>
        {value}
      </Text>
    </View>
  );
}
