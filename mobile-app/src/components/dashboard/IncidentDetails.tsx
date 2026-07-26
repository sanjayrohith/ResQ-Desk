import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  Activity,
  Brain,
  MapPin,
  Sparkles,
  Tag,
  Target,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react-native';
import { colors, fontFamily, severityConfig } from '../../theme';
import { PanelHeader } from '../ui/PanelHeader';
import { StatusBadge } from '../ui/StatusBadge';
import { DataCell, DataLabel } from '../ui/DataCell';
import { KeywordTag } from '../ui/KeywordTag';
import { useCountUp } from '../../hooks/useCountUp';
import { IncidentData } from '../../api/types';

const R = 32;
const CIRC = 2 * Math.PI * R;

export function IncidentDetails({ data, isLoading }: { data: IncidentData; isLoading?: boolean }) {
  const hasData = !!data.location && data.location !== 'Awaiting data...';

  const safeSeverity = data.severity
    ? ((data.severity.charAt(0).toUpperCase() + data.severity.slice(1).toLowerCase()) as keyof typeof severityConfig)
    : 'Normal';
  const severityStyle = severityConfig[safeSeverity] || severityConfig.Normal;
  const confidencePercent = hasData && data.confidence_score ? Math.round(data.confidence_score * 100) : 0;
  const animatedConfidence = useCountUp(confidencePercent, 1200);
  const displayConfidence = Math.round(animatedConfidence);

  return (
    <View style={styles.container}>
      <PanelHeader
        icon={
          <View
            style={[
              styles.iconChip,
              { backgroundColor: isLoading ? 'rgba(194,194,203,0.2)' : hasData ? 'rgba(16,185,129,0.2)' : 'rgba(42,42,39,0.5)' },
            ]}>
            <Target size={16} color={isLoading ? colors.cyan[400] : hasData ? colors.emerald[400] : colors.slate[500]} />
          </View>
        }
        title="INCIDENT REPORT"
        right={
          <StatusBadge variant={isLoading ? 'live' : hasData ? 'online' : 'neutral'}>
            {isLoading ? (
              <View style={styles.badgeInline}>
                <Sparkles size={12} color={colors.cyan[400]} />
                <Text style={styles.badgeInlineText}> AI ANALYZING</Text>
              </View>
            ) : hasData ? (
              'DATA COMPLETE'
            ) : (
              'AWAITING INPUT'
            )}
          </StatusBadge>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row2}>
          <View style={styles.col}>
            <DataLabel icon={<ShieldAlert size={14} color={colors.slate[500]} />}>Emergency Type</DataLabel>
            <DataCell active={hasData} style={styles.h14}>
              <Text style={[styles.emergencyType, { color: hasData ? colors.foreground : colors.slate[700] }]}>
                {hasData ? data.emergency_type : '—'}
              </Text>
            </DataCell>
          </View>

          <View style={styles.col}>
            <DataLabel icon={<Activity size={14} color={colors.slate[500]} />}>Severity Level</DataLabel>
            <DataCell style={[styles.h14, styles.centerContent]}>
              {hasData ? (
                <View
                  style={[
                    styles.severityPill,
                    { backgroundColor: severityStyle.bg, borderColor: severityStyle.border },
                  ]}>
                  <Text style={[styles.severityText, { color: severityStyle.text }]}>{severityStyle.label}</Text>
                </View>
              ) : (
                <Text style={styles.dash}>—</Text>
              )}
            </DataCell>
          </View>
        </View>

        <View style={styles.col}>
          <DataLabel icon={<MapPin size={14} color={colors.slate[500]} />}>Identified Location</DataLabel>
          <DataCell active={hasData}>
            <Text style={[styles.locationText, { color: hasData ? colors.foreground : colors.slate[700] }]}>
              {hasData ? data.location : 'Waiting for location data...'}
            </Text>
          </DataCell>
        </View>

        <View style={styles.row12}>
          <View style={styles.col4}>
            <DataLabel icon={<TrendingUp size={14} color={colors.slate[500]} />}>AI Confidence</DataLabel>
            <DataCell style={styles.confidenceCell}>
              <View style={styles.gaugeWrap}>
                <Svg width={80} height={80} viewBox="0 0 80 80">
                  <Circle cx={40} cy={40} r={R} stroke={colors.slate[800]} strokeWidth={6} fill="none" />
                  <Circle
                    cx={40}
                    cy={40}
                    r={R}
                    stroke={hasData ? colors.cyan[400] : colors.slate[700]}
                    strokeWidth={6}
                    fill="none"
                    strokeDasharray={`${(animatedConfidence / 100) * CIRC} ${CIRC}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </Svg>
                <View style={styles.gaugeCenter}>
                  <Text style={[styles.gaugeValue, { color: hasData ? colors.cyan[400] : colors.slate[700] }]}>
                    {displayConfidence}
                  </Text>
                </View>
              </View>
              <Text style={styles.gaugeCaption}>Percent</Text>
            </DataCell>
          </View>

          <View style={styles.col8}>
            <DataLabel icon={<Tag size={14} color={colors.slate[500]} />}>Detected Keywords</DataLabel>
            <DataCell style={styles.keywordsCell}>
              {hasData && data.keywords && data.keywords.length > 0 ? (
                <View style={styles.keywordsWrap}>
                  {data.keywords.map((k, i) => (
                    <KeywordTag key={i}>{k}</KeywordTag>
                  ))}
                </View>
              ) : (
                <View style={styles.centerFill}>
                  <Text style={styles.noKeywords}>No keywords detected</Text>
                </View>
              )}
            </DataCell>
          </View>
        </View>

        <View style={styles.col}>
          <DataLabel icon={<Brain size={14} color={colors.slate[500]} />}>AI Reasoning</DataLabel>
          <DataCell active={hasData} style={styles.reasoningCell}>
            <Text style={[styles.reasoningText, { color: hasData ? colors.slate[300] : colors.slate[700] }]}>
              {hasData ? `"${data.reasoning}"` : 'Waiting for AI analysis...'}
            </Text>
          </DataCell>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconChip: { padding: 6, borderRadius: 10 },
  badgeInline: { flexDirection: 'row', alignItems: 'center' },
  badgeInlineText: { fontFamily: fontFamily.sansSemibold, fontSize: 10, color: colors.cyan[400] },
  content: { padding: 20, gap: 16 },
  row2: { flexDirection: 'row', gap: 16 },
  col: { flex: 1, gap: 8 },
  h14: { height: 56, justifyContent: 'center' },
  centerContent: { alignItems: 'center' },
  emergencyType: {
    fontFamily: fontFamily.monoBold,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  severityPill: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  severityText: { fontFamily: fontFamily.sansBold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  dash: { color: colors.slate[700], fontFamily: fontFamily.mono },
  locationText: { fontFamily: fontFamily.mono, fontSize: 14 },
  row12: { flexDirection: 'row', gap: 16 },
  col4: { flex: 4, gap: 8 },
  col8: { flex: 8, gap: 8 },
  confidenceCell: { alignItems: 'center', paddingVertical: 20 },
  gaugeWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gaugeCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  gaugeValue: { fontFamily: fontFamily.monoBold, fontSize: 24 },
  gaugeCaption: { fontFamily: fontFamily.sansMedium, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.slate[500] },
  keywordsCell: { minHeight: 120 },
  keywordsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  centerFill: { flex: 1, minHeight: 88, alignItems: 'center', justifyContent: 'center' },
  noKeywords: { color: colors.slate[600], fontFamily: fontFamily.sans, fontSize: 14 },
  reasoningCell: { minHeight: 80 },
  reasoningText: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
});
