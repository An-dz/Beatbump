import { MusicResponsiveListItemRenderer } from "$lib/parsers/items/musicResponsiveListItemRenderer";
import { filter, map } from "$lib/utils";
type Data = {
	contents: {
		twoColumnBrowseResultsRenderer: {
			secondaryContents: {
				sectionListRenderer: {
					contents: [{ musicShelfRenderer: { contents } }];
				}
			},
			tabs: [
				{
					tabRenderer: {
						content: {
							sectionListRenderer: {
								contents: [
									{
										musicResponsiveHeaderRenderer: {
											buttons: {
												menuRenderer: {
													items: {
														menuNavigationItemRenderer: {
															navigationEndpoint: {
																watchPlaylistEndpoint: { playlistId: string }
															}
														}
													}[]
												}
											}[]
											title;
											subtitle: {
												runs: { text: string }[]
											}
											straplineTextOne: {
												runs: {
													navigationEndpoint: { browseEndpoint: { browseId: string } }
												}[]
											}
											thumbnail;
											subtitleBadges;
											secondSubtitle: { runs: { text: string }[] }
										};
									},
								];
							};
						};
					};
				},
			];
		};
	};
};
/* eslint-disable no-prototype-builtins */
export function parsePageContents(data: Data) {
	const contents =
		data.contents?.twoColumnBrowseResultsRenderer?.secondaryContents.sectionListRenderer.contents[0]
			.musicShelfRenderer.contents || [];

	const songs = map(contents, ({ musicResponsiveListItemRenderer }, index) => ({
		...MusicResponsiveListItemRenderer({ musicResponsiveListItemRenderer }),
		index,
	}));

	const releaseInfoParser = () => {
		const root = data.contents?.twoColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]?.musicResponsiveHeaderRenderer;
		// console.log(data.header.musicDetailHeaderRenderer.subtitle.runs);
		const year = root?.subtitle?.runs.at(-1);
		const length = root?.subtitle?.runs[0];
		const artists = filter(
			root?.straplineTextOne?.runs,
			(item) => !!item?.navigationEndpoint?.browseEndpoint?.browseId,
		).map((item) => ({
			name: item.text,
			channelId: item?.navigationEndpoint?.browseEndpoint?.browseId || "",
		}));
		return {
			playlistId:
				root.buttons[2]?.menuRenderer?.items[0]?.menuNavigationItemRenderer.navigationEndpoint
					.watchPlaylistEndpoint.playlistId,
			subtitles: [
				{
					year: year.text,
					tracks: root?.secondSubtitle?.runs[0].text,
					length: root?.secondSubtitle?.runs[2]?.text,
					type: length.text,
					contentRating: !!root?.subtitleBadges,
				},
			],
			secondSubtitle: [],
			artist: artists,
			thumbnails:
				root?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails,
			title: root.title?.runs[0].text,
			autoMixId:
				root.buttons[2]?.menuRenderer?.items[1]?.menuNavigationItemRenderer
					?.navigationEndpoint?.watchPlaylistEndpoint?.playlistId || null,
		};
	};
	const releaseInfo = releaseInfoParser();
	// console.log(releaseInfo)

	return {
		items: songs,
		releaseInfo: releaseInfo,
	};
}
